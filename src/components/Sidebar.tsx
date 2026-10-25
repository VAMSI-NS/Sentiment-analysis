import React from 'react';
import { Page } from '../types';
import {
  LayoutDashboard,
  MessageSquareText,
  FileSpreadsheet,
  ChartNoAxesCombined,
  Activity,
  Settings,
  BrainCircuit,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onSelectPage: (page: Page) => void;
  apiStatus: 'online' | 'offline' | 'checking';
  modelLoaded: boolean;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  apiStatus,
  modelLoaded,
  historyCount,
}) => {
  const navItems: { id: Page; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Analyze Feedback', label: 'Analyze Feedback', icon: MessageSquareText },
    { id: 'Batch Analysis', label: 'Batch Analysis', icon: FileSpreadsheet },
    { id: 'Model Evaluation', label: 'Model Evaluation', icon: ChartNoAxesCombined },
    { id: 'Saved Analyses', label: 'Saved Analyses', icon: Activity, badge: historyCount > 0 ? historyCount : undefined },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand & Top Navigation */}
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-[#0f172a] flex items-center">
              Feedback<span className="text-indigo-600">AI</span>
            </div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Student Intelligence
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom widgets & status */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {/* Backend status card */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${apiStatus === 'online' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              Backend Status
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                apiStatus === 'online'
                  ? 'bg-emerald-100 text-emerald-800'
                  : apiStatus === 'checking'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {apiStatus === 'online' ? (modelLoaded ? 'Connected (Model)' : 'Connected') : apiStatus === 'checking' ? 'Checking' : 'Demo Fallback'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {apiStatus === 'online'
              ? 'Backend API and inference engine online.'
              : 'Using in-browser sentiment heuristic.'}
          </p>
        </div>

        {/* Helpful Capstone Note */}
        <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Capstone Ready</span>
          </div>
          <p className="text-[11px] text-indigo-700 leading-snug">
            All demo predictions & metrics are clearly marked for academic compliance.
          </p>
        </div>

        {/* Project footer info */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>FeedbackAI v1.0</span>
          <button
            onClick={() => onSelectPage('Settings')}
            className="hover:text-indigo-600 transition-colors flex items-center gap-0.5"
          >
            Config <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
