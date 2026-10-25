import React, { useState } from 'react';
import { Prediction, Sentiment, Page } from '../types';
import { SentimentBadge, SourceBadge } from './Badge';
import {
  Search,
  Trash2,
  Download,
  Activity,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface SavedViewProps {
  history: Prediction[];
  onClearHistory: () => void;
  onNavigate: (page: Page) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  history,
  onClearHistory,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Sentiment>('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.text.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.sentiment === filter;
    return matchesSearch && matchesFilter;
  });

  const handleExportJson = () => {
    if (history.length === 0) return;
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-student-sentiment-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">
            Session History
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Saved Analyses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inspect all predictions from this browser session. History can be exported or cleared anytime.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClearHistory}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(['all', 'positive', 'neutral', 'negative'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  filter === s
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved comments…"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* History Table */}
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4 font-semibold">Feedback Comment</th>
                  <th className="py-2.5 px-4 font-semibold w-32">Sentiment</th>
                  <th className="py-2.5 px-4 font-semibold w-24">Confidence</th>
                  <th className="py-2.5 px-4 font-semibold w-28">Source</th>
                  <th className="py-2.5 px-4 font-semibold w-32">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-800 font-medium leading-relaxed max-w-xl">
                      "{item.text}"
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SentimentBadge sentiment={item.sentiment} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-slate-700">
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SourceBadge source={item.source} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {item.timestamp || 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm">No saved analyses found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {search ? `No feedback matching "${search}".` : 'Analyze comments in the workspace to save them here.'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => onNavigate('Analyze Feedback')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <span>Analyze Student Feedback</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
