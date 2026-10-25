import React, { lazy, Suspense } from 'react';
import { Page, Prediction, TrendPoint } from '../types';
import { KpiCard } from './KpiCard';
import { SentimentBadge, SourceBadge } from './Badge';
import {
  MessageSquareText,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Info,
} from 'lucide-react';

const OverviewCharts = lazy(() => import('./OverviewCharts'));

interface OverviewViewProps {
  onNavigate: (page: Page) => void;
  trendData: TrendPoint[];
  recentFeedback: Prediction[];
  modelLoaded: boolean;
  apiStatus: 'online' | 'offline' | 'checking';
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  trendData,
  recentFeedback,
  modelLoaded,
  apiStatus,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Student Feedback Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Understand every voice.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-indigo-100 font-serif italic">
                Improve every experience.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-xl">
              Turn student course reviews and campus comments into clear, actionable sentiment insights.
              Analyze individual remarks, process CSV batches, and validate ML pipelines.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('Analyze Feedback')}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Analyze Feedback</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button
                onClick={() => onNavigate('Model Evaluation')}
                className="px-4 py-2.5 rounded-xl bg-indigo-700/50 hover:bg-indigo-700/80 border border-indigo-400/30 text-white font-medium text-sm transition-all"
              >
                Explore Model Metrics
              </button>
            </div>
          </div>

          {/* Hero right visual badge */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-64 sm:w-72 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-inner">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-indigo-200 font-medium">Model Engine</div>
                  <div className="text-sm font-bold text-white">
                    {modelLoaded ? 'Trained Scikit Pipeline' : 'Demo Fallback Active'}
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex justify-between items-center text-indigo-100">
                  <span>Positive Sentiment</span>
                  <span className="font-bold text-emerald-300">64.2%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '64.2%' }} />
                </div>
                <div className="flex justify-between items-center text-[11px] text-indigo-200/80 pt-1">
                  <span>Backend status</span>
                  <span className="font-semibold text-white">
                    {apiStatus === 'online' ? '127.0.0.1:8000' : 'In-browser heuristic'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Feedback Analyzed"
          value="1,284"
          sub="Illustrative total volume"
          icon={MessageSquareText}
          tone="blue"
          illustrative
          onClick={() => onNavigate('Saved Analyses')}
        />
        <KpiCard
          title="Positive Sentiment"
          value="64.2%"
          sub="Illustrative positive ratio"
          icon={TrendingUp}
          tone="emerald"
          illustrative
          onClick={() => onNavigate('Analyze Feedback')}
        />
        <KpiCard
          title="Needs Attention"
          value="13.4%"
          sub="Critical / negative feedback"
          icon={AlertCircle}
          tone="amber"
          illustrative
          onClick={() => onNavigate('Analyze Feedback')}
        />
        <KpiCard
          title="Model Status"
          value={modelLoaded ? 'Trained' : 'Demo Mode'}
          sub={apiStatus === 'online' ? 'API connected' : 'Local browser heuristic'}
          icon={ShieldCheck}
          tone="purple"
          illustrative={!modelLoaded}
          onClick={() => onNavigate('Model Evaluation')}
        />
      </section>

      {/* Interactive Charts Section */}
      <Suspense fallback={<div className="h-[600px] lg:h-[360px]" aria-hidden="true" />}>
        <OverviewCharts trendData={trendData} />
      </Suspense>

      {/* Recent Feedback Preview Table */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">Recent Student Feedback</h2>
            <p className="text-xs text-slate-500">Live predictions and session feedback analysis</p>
          </div>
          <button
            onClick={() => onNavigate('Saved Analyses')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View all analyses →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 font-semibold">Feedback Comment</th>
                <th className="py-2.5 px-3 font-semibold">Sentiment</th>
                <th className="py-2.5 px-3 font-semibold">Confidence</th>
                <th className="py-2.5 px-3 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFeedback.slice(0, 4).map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 max-w-md font-medium text-slate-800">
                    "{item.text}"
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <SentimentBadge sentiment={item.sentiment} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-medium text-slate-700">
                    {Math.round(item.confidence * 100)}%
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <SourceBadge source={item.source} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Academic Capstone Disclaimer:</span>
          <p className="text-amber-800 leading-relaxed">
            The dashboard KPI values and weekly charts are illustrative mock figures. In your real capstone presentation,
            you should compute actual metrics by running the provided Python training pipeline (<code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono">python -m app.train</code>) on your curated student dataset.
          </p>
        </div>
      </div>
    </div>
  );
};
