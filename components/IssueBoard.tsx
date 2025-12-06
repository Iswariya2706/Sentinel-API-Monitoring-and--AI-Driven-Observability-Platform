import React, { useState, useMemo } from 'react';
import { ApiLog, IssueStatus, Developer } from '../types';
import { CheckCircle, AlertOctagon, UserCircle, Cpu, Filter } from 'lucide-react';
import { MOCK_DEVELOPERS } from '../services/mockData';

interface IssueBoardProps {
  logs: ApiLog[];
  onResolve: (id: string) => void;
  onAssign: (logId: string, devId: string) => void;
  onAnalyze: (log: ApiLog) => void;
}

export const IssueBoard: React.FC<IssueBoardProps> = ({ logs, onResolve, onAssign, onAnalyze }) => {
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'ALL'>(IssueStatus.OPEN);

  const issues = useMemo(() => {
    // Issues are logs with 5xx or slow or rate limit
    let problematic = logs.filter(l => l.statusCode >= 500 || l.latencyMs > 500 || l.isRateLimitHit);
    
    if (filterStatus !== 'ALL') {
      problematic = problematic.filter(l => l.status === filterStatus);
    }
    return problematic;
  }, [logs, filterStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-white">Issue Tracker</h2>
           <p className="text-slate-400 text-sm">Manage API incidents and assign developers</p>
        </div>
        
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterStatus(IssueStatus.OPEN)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filterStatus === IssueStatus.OPEN ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilterStatus(IssueStatus.RESOLVED)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filterStatus === IssueStatus.RESOLVED ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filterStatus === 'ALL' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {issues.length === 0 ? (
          <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-800">
            <CheckCircle className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
            <h3 className="text-slate-300 font-medium text-lg">All caught up!</h3>
            <p className="text-slate-500">No issues found matching your filters.</p>
          </div>
        ) : (
          issues.map(issue => (
            <div key={issue.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex flex-col lg:flex-row gap-4 justify-between">
                
                {/* Issue Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-1 p-2 rounded-lg ${
                    issue.statusCode >= 500 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <AlertOctagon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-200">{issue.serviceName}</h4>
                      <span className="text-xs font-mono text-slate-500">ID: {issue.id}</span>
                      {issue.status === IssueStatus.RESOLVED && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 font-mono mb-2">
                      <span className={`font-bold ${
                        issue.method === 'GET' ? 'text-blue-400' : 
                        issue.method === 'POST' ? 'text-emerald-400' : 'text-yellow-400'
                      }`}>{issue.method}</span> {issue.endpoint}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className={`px-2 py-1 rounded bg-slate-800 ${issue.statusCode >= 500 ? 'text-red-400' : 'text-slate-300'}`}>
                        Status: {issue.statusCode}
                      </span>
                      <span className={`px-2 py-1 rounded bg-slate-800 ${issue.latencyMs > 500 ? 'text-amber-400' : 'text-slate-300'}`}>
                        Latency: {issue.latencyMs}ms
                      </span>
                      <span className="text-slate-500">{new Date(issue.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex flex-col sm:flex-row items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                  
                  {/* Assignee */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Assignee</label>
                    <div className="relative">
                      <select 
                        className="w-full sm:w-40 appearance-none bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={issue.assignedTo || ''}
                        onChange={(e) => onAssign(issue.id, e.target.value)}
                        disabled={issue.status === IssueStatus.RESOLVED}
                      >
                        <option value="">Unassigned</option>
                        {MOCK_DEVELOPERS.map(dev => (
                          <option key={dev.id} value={dev.id}>{dev.name}</option>
                        ))}
                      </select>
                      <UserCircle size={16} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onAnalyze(issue)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 border border-purple-600/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Cpu size={16} />
                      AI Analyze
                    </button>
                    {issue.status === IssueStatus.OPEN && (
                      <button
                        onClick={() => onResolve(issue.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-600/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle size={16} />
                        Resolve
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};