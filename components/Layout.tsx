import React from 'react';
import { LayoutDashboard, List, Activity, Settings, LogOut, ClipboardList } from 'lucide-react';
import { PageView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onLogout: () => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onLogout }) => {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-blue-500">
            <Activity size={28} />
            <span className="text-xl font-bold tracking-tight text-white">Sentinel</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Observability</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            isActive={currentPage === 'DASHBOARD'} 
            onClick={() => onNavigate('DASHBOARD')} 
          />
          <NavItem 
            icon={ClipboardList} 
            label="Issue Management" 
            isActive={currentPage === 'ISSUES'} 
            onClick={() => onNavigate('ISSUES')} 
          />
          <NavItem 
            icon={List} 
            label="API Explorer" 
            isActive={currentPage === 'EXPLORER'} 
            onClick={() => onNavigate('EXPLORER')} 
          />
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-xs font-semibold text-slate-500 mb-2">SYSTEM</p>
            <NavItem 
              icon={Settings} 
              label="Settings" 
              isActive={false} 
              onClick={() => {}} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center w-full gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 relative">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};