import React from 'react';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import { Alert } from '../types';

interface AlertFeedProps {
  alerts: Alert[];
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Bell size={16} className="text-blue-400" />
          Live Alerts
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 animate-pulse">
          Live
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="text-center text-slate-500 py-10 text-sm">
            No active alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3 rounded-lg border text-sm flex gap-3 animate-in slide-in-from-right fade-in duration-300 ${
                alert.type === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                alert.type === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                'bg-blue-500/10 border-blue-500/20 text-blue-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {alert.type === 'CRITICAL' ? <AlertCircle size={16} className="text-red-400" /> :
                 alert.type === 'WARNING' ? <AlertTriangle size={16} className="text-amber-400" /> :
                 <Info size={16} className="text-blue-400" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};