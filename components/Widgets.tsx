import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: any;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon: Icon, colorClass }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend}
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </div>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

export const TrafficChart: React.FC<{ data: DashboardStats['requestsOverTime'] }> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Live Traffic (Last 20s)</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
           <span className="w-2 h-2 rounded-full bg-blue-500"></span> Success
           <span className="w-2 h-2 rounded-full bg-red-500"></span> Error
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={2} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
            itemStyle={{ color: '#e2e8f0' }}
            animationDuration={300}
          />
          <Area type="monotone" dataKey="success" stackId="1" stroke="#3b82f6" fill="url(#colorSuccess)" strokeWidth={2} name="Success" isAnimationActive={false} />
          <Area type="monotone" dataKey="error" stackId="1" stroke="#ef4444" fill="url(#colorError)" strokeWidth={2} name="Errors" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SlowEndpointsList: React.FC<{ endpoints: DashboardStats['topSlowEndpoints'] }> = ({ endpoints }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Top Slow Endpoints</h3>
    <div className="space-y-4">
      {endpoints.map((ep, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                {ep.service}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 truncate" title={ep.endpoint}>
              {ep.endpoint}
            </p>
          </div>
          <div className="text-right">
            <span className="block text-lg font-bold text-amber-500">{ep.avgLatency}ms</span>
            <span className="text-xs text-slate-500">avg latency</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);