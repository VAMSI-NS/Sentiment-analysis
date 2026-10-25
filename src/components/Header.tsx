import React, { useState } from 'react';
import { Page } from '../types';
import {
  Menu,
  X,
  Radio,
  BrainCircuit,
  LayoutDashboard,
  MessageSquareText,
  FileSpreadsheet,
  ChartNoAxesCombined,
  Activity,
  Settings,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentPage: Page;
  onSelectPage: (page: Page) => void;
  apiStatus: 'online' | 'offline' | 'checking';
  modelLoaded: boolean;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  apiStatus,
  modelLoaded,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Analyze Feedback', label: 'Analyze Feedback', icon: MessageSquareText },
    { id: 'Batch Analysis', label: 'Batch Analysis', icon: FileSpreadsheet },
    { id: 'Model Evaluation', label: 'Model Evaluation', icon: ChartNoAxesCombined },
    { id: 'Saved Analyses', label: 'Saved Analyses', icon: Activity },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const handleMobileNav = (page: Page) => {
    onSelectPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Left side: Mobile button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hidden sm:inline">Workspace</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="font-bold text-[#0f172a]">{currentPage}</span>
          </div>
        </div>

        {/* Right side: Live status pill & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => onSelectPage('Settings')}
            role="button"
            tabIndex={0}
            className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-emerald-500 animate-pulse'
                  : apiStatus === 'checking'
                  ? 'bg-blue-400 animate-ping'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-medium text-slate-700">
              {apiStatus === 'online'
                ? modelLoaded
                  ? 'Backend Connected (Model Loaded)'
                  : 'Backend Connected'
                : 'Demo Mode (Client Heuristic)'}
            </span>
          </div>

          {currentPage !== 'Analyze Feedback' && (
            <button
              onClick={() => onSelectPage('Analyze Feedback')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Feedback</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#0f172a]">
                      Feedback<span className="text-indigo-600">AI</span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">
                      Student Intelligence
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNav(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'Saved Analyses' && historyCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {historyCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                Backend Integration
              </div>
              <p className="text-[11px] text-slate-500">
                Connects to FastAPI at <code className="font-mono">127.0.0.1:8000</code> with client-side fallback.
              </p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
