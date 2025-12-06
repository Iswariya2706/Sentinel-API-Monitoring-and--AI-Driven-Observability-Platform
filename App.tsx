import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { StatCard, TrafficChart, SlowEndpointsList } from './components/Widgets';
import { LogTable } from './components/LogTable';
import { AlertFeed } from './components/AlertFeed';
import { IssueBoard } from './components/IssueBoard';
import { AnalysisModal } from './components/AnalysisModal';
import { fetchLogs, fetchStats, resolveIssue, assignIssue, startSimulation, stopSimulation, subscribeToRealtimeUpdates } from './services/mockData';
import { analyzeLogWithGemini } from './services/geminiService';
import { DashboardStats, ApiLog, PageView, User, Alert, IssueStatus } from './types';
import { Activity, AlertTriangle, Clock, ShieldAlert, Filter, RefreshCw, Lock } from 'lucide-react';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex justify-center mb-8">
        <div className="p-4 bg-blue-600/10 rounded-full">
          <Activity size={48} className="text-blue-500" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
      <p className="text-slate-400 text-center mb-8">Sign in to Sentinel Observability Platform</p>
      
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
          <div className="relative">
            <input 
              type="text" 
              defaultValue="admin"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
          <div className="relative">
             <input 
              type="password" 
              defaultValue="password"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
        >
          <Lock size={18} />
          Sign In
        </button>
      </form>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageView>('LOGIN');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filters, setFilters] = useState({ status: 'ALL', service: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // AI Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Manual refresh logic
  const loadData = useCallback(async () => {
    if (!stats) setIsLoading(true);
    try {
      const [newStats, newLogs] = await Promise.all([
        fetchStats(),
        fetchLogs(filters)
      ]);
      setStats(newStats);
      setLogs(newLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [filters, stats]);

  // Initial Data Load & Realtime Subscription
  useEffect(() => {
    if (user) {
      // 1. Load initial data
      loadData();
      
      // 2. Start the simulation engine
      startSimulation();
      
      // 3. Subscribe to the full firehose
      const unsubscribe = subscribeToRealtimeUpdates(({ newLog, newAlert, stats: updatedStats }) => {
        // Update stats (including chart data) immediately
        setStats(updatedStats);

        // Update alerts if present
        if (newAlert) {
          setAlerts(prev => [newAlert, ...prev].slice(0, 50));
        }

        // Update logs if present
        if (newLog) {
          // Note: In a real app we might debounce this to prevent flickering,
          // but for "real-time feel" we update immediately.
          setLogs(prev => {
             // Respect filters before adding (simple client-side check)
             let shouldShow = true;
             if (filters.service && newLog.serviceName !== filters.service) shouldShow = false;
             if (filters.status === 'SLOW' && newLog.latencyMs <= 500) shouldShow = false;
             if (filters.status === 'BROKEN' && newLog.statusCode < 500) shouldShow = false;
             
             if (shouldShow) {
               return [newLog, ...prev].slice(0, 500);
             }
             return prev;
          });
        }
      });

      return () => {
        stopSimulation();
        unsubscribe();
      };
    }
  }, [user, filters]); // Re-subscribe if filters change to ensure logs logic is consistent

  const handleLogin = () => {
    setUser({ id: '1', username: 'admin', role: 'ADMIN', token: 'mock-jwt' });
    setCurrentPage('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('LOGIN');
    stopSimulation();
  };

  const handleResolve = async (id: string) => {
    await resolveIssue(id);
    setLogs(prev => prev.map(l => l.id === id ? { ...l, status: IssueStatus.RESOLVED } : l));
  };

  const handleAssign = async (logId: string, devId: string) => {
    await assignIssue(logId, devId);
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, assignedTo: devId } : l));
  };

  const handleAnalyze = async (log: ApiLog) => {
    setIsModalOpen(true);
    setIsAnalyzing(true);
    setModalContent('');
    
    const analysis = await analyzeLogWithGemini(log);
    setModalContent(analysis);
    setIsAnalyzing(false);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {currentPage === 'DASHBOARD' ? 'System Overview' : 
               currentPage === 'ISSUES' ? 'Issue Management' : 
               'API Log Explorer'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live monitoring for microservices cluster
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE DATA
            </span>
            <button 
              onClick={loadData}
              className={`p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {currentPage === 'DASHBOARD' && stats && (
          <div className="flex flex-col lg:flex-row gap-6">
             <div className="flex-1 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total Requests" 
                    value={stats.totalRequests.toLocaleString()} 
                    icon={Activity} 
                    colorClass="bg-blue-500 text-blue-500"
                    trend="+12/sec"
                    trendUp={true}
                  />
                  <StatCard 
                    title="Avg Latency" 
                    value={`${stats.avgLatency}ms`} 
                    icon={Clock} 
                    colorClass="bg-indigo-500 text-indigo-500"
                    trend={stats.avgLatency > 300 ? 'High' : 'Normal'}
                    trendUp={stats.avgLatency < 300}
                  />
                  <StatCard 
                    title="Broken APIs (5xx)" 
                    value={stats.brokenRequestCount} 
                    icon={AlertTriangle} 
                    colorClass="bg-red-500 text-red-500"
                    trend={stats.brokenRequestCount > 0 ? 'Critical' : 'Stable'}
                    trendUp={stats.brokenRequestCount === 0}
                  />
                  <StatCard 
                    title="Rate Limit Hits" 
                    value={stats.rateLimitCount} 
                    icon={ShieldAlert} 
                    colorClass="bg-amber-500 text-amber-500"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <TrafficChart data={stats.requestsOverTime} />
                  </div>
                  <div className="xl:col-span-1">
                    <SlowEndpointsList endpoints={stats.topSlowEndpoints} />
                  </div>
                </div>
             </div>

             {/* Right Sidebar: Real-time Alerts */}
             <div className="w-full lg:w-80 shrink-0 h-[800px] sticky top-6">
               <AlertFeed alerts={alerts} />
             </div>
          </div>
        )}

        {currentPage === 'ISSUES' && (
           <IssueBoard 
             logs={logs}
             onResolve={handleResolve}
             onAssign={handleAssign}
             onAnalyze={handleAnalyze}
           />
        )}

        {currentPage === 'EXPLORER' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter size={18} />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <select 
                className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.service}
                onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
              >
                <option value="">All Services</option>
                <option value="order-service">Order Service</option>
                <option value="payment-service">Payment Service</option>
                <option value="user-service">User Service</option>
              </select>
              <select 
                 className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                 value={filters.status}
                 onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="ALL">All Status</option>
                <option value="SLOW">Slow ({'>'}500ms)</option>
                <option value="BROKEN">Broken (5xx)</option>
                <option value="RATE_LIMIT">Rate Limited</option>
              </select>
            </div>

            <LogTable 
              logs={logs} 
              onResolve={handleResolve} 
              onAnalyze={handleAnalyze} 
            />
          </div>
        )}
      </Layout>
      
      <AnalysisModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isLoading={isAnalyzing}
        content={modalContent}
      />
    </>
  );
};

export default App;