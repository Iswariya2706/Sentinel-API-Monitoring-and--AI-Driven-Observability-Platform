import React from 'react';
import { ApiLog, IssueStatus } from '../types';
import { AlertCircle, CheckCircle, Search, Cpu, Clock, AlertTriangle } from 'lucide-react';

interface LogTableProps {
  logs: ApiLog[];
  onResolve: (id: string) => void;
  onAnalyze: (log: ApiLog) => void;
}

const StatusBadge = ({ code }: { code: number }) => {
  if (code >= 500) return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400">5xx Error</span>;
  if (code === 429) return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400">Rate Limit</span>;
  if (code >= 400) return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-500/10 text-orange-400">4xx Client</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">Success</span>;
};

export const LogTable: React.FC<LogTableProps> = ({ logs, onResolve, onAnalyze }) => {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900 rounded-xl border border-slate-800">
        <Search className="w-12 h-12 text-slate-700 mb-4" />
        <h3 className="text-slate-400 font-medium">No logs found matching filters</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/50">
            <th className="px-6 py-4 font-semibold">Timestamp</th>
            <th className="px-6 py-4 font-semibold">Service</th>
            <th className="px-6 py-4 font-semibold">Endpoint</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold text-right">Latency</th>
            <th className="px-6 py-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-800/50 transition-colors group">
              <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                {new Date(log.timestamp).toLocaleTimeString()}
              </td>
              <td className="px-6 py-4 text-sm text-slate-300">
                {log.serviceName}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    log.method === 'GET' ? 'border-blue-500/30 text-blue-400' :
                    log.method === 'POST' ? 'border-emerald-500/30 text-emerald-400' :
                    log.method === 'DELETE' ? 'border-red-500/30 text-red-400' :
                    'border-slate-500/30 text-slate-400'
                  }`}>
                    {log.method}
                  </span>
                  <span className="text-sm text-slate-200 font-mono truncate max-w-[200px]" title={log.endpoint}>
                    {log.endpoint}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge code={log.statusCode} />
                {log.isRateLimitHit && (
                   <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20">
                     LIMIT
                   </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <span className={`text-sm font-mono font-medium ${log.latencyMs > 500 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {log.latencyMs}ms
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(log.statusCode >= 500 || log.latencyMs > 500) && log.status === IssueStatus.OPEN ? (
                    <>
                      <button
                        onClick={() => onAnalyze(log)}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                        title="Analyze with AI"
                      >
                        <Cpu size={16} />
                      </button>
                      <button
                        onClick={() => onResolve(log.id)}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                        title="Mark Resolved"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">No actions</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
