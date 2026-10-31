import React, { lazy, Suspense } from 'react';
import { AlertCircle, MessageSquareText, Users, TrendingUp } from 'lucide-react';
import { AdminSummary, FeedbackRecord, Page } from '../types';
import { KpiCard } from './KpiCard';
import { SentimentBadge } from './Badge';

const OverviewCharts = lazy(() => import('./OverviewCharts'));

interface AdminOverviewProps {
  summary: AdminSummary;
  recentFeedback: FeedbackRecord[];
  onNavigate: (page: Page) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ summary, recentFeedback, onNavigate }) => {
  const total = summary.total_feedback;
  const percent = (count: number) => total ? `${Math.round((count / total) * 100)}%` : '0%';
  const trend = summary.trend.length
    ? summary.trend
    : [
        { day: 'Mon', positive: 0, neutral: 0, negative: 0 },
        { day: 'Tue', positive: 0, neutral: 0, negative: 0 },
        { day: 'Wed', positive: 0, neutral: 0, negative: 0 },
        { day: 'Thu', positive: 0, neutral: 0, negative: 0 },
        { day: 'Fri', positive: 0, neutral: 0, negative: 0 },
        { day: 'Sat', positive: 0, neutral: 0, negative: 0 },
        { day: 'Sun', positive: 0, neutral: 0, negative: 0 },
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white">
        <div className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Dean dashboard</div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">Feedback overview</h1>
        <p className="mt-2 text-sm text-indigo-100/85">Live summary of registered students and saved feedback submissions.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Feedback" value={total.toLocaleString()} sub="Saved submissions" icon={MessageSquareText} tone="blue" illustrative={false} onClick={() => onNavigate('Feedback Management')} />
        <KpiCard title="Positive" value={summary.sentiment_counts.positive.toLocaleString()} sub={`${percent(summary.sentiment_counts.positive)} of submissions`} icon={TrendingUp} tone="emerald" illustrative={false} onClick={() => onNavigate('Feedback Management')} />
        <KpiCard title="Negative" value={summary.sentiment_counts.negative.toLocaleString()} sub={`${percent(summary.sentiment_counts.negative)} of submissions`} icon={AlertCircle} tone="amber" illustrative={false} onClick={() => onNavigate('Feedback Management')} />
        <KpiCard title="Neutral" value={summary.sentiment_counts.neutral.toLocaleString()} sub={`${percent(summary.sentiment_counts.neutral)} of submissions`} icon={MessageSquareText} tone="purple" illustrative={false} onClick={() => onNavigate('Feedback Management')} />
        <KpiCard title="Students" value={summary.total_students.toLocaleString()} sub="Registered accounts" icon={Users} tone="indigo" illustrative={false} onClick={() => onNavigate('Registered Students')} />
      </section>

      <Suspense fallback={<div className="h-[600px] lg:h-[360px]" aria-hidden="true" />}>
        <OverviewCharts trendData={trend} sentimentCounts={summary.sentiment_counts} totalFeedback={total} />
      </Suspense>

      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#0f172a]">Recent student feedback</h2>
            <p className="text-xs text-slate-500 mt-1">Latest records saved to the feedback database.</p>
          </div>
          <button type="button" onClick={() => onNavigate('Feedback Management')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            Manage feedback →
          </button>
        </div>
        {recentFeedback.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-semibold">Feedback</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Sentiment</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFeedback.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 max-w-lg text-slate-700 truncate">{item.text}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.student_email}</td>
                    <td className="px-4 py-3"><SentimentBadge sentiment={item.sentiment} size="sm" /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-slate-400">No feedback submissions have been recorded yet.</div>
        )}
      </section>
    </div>
  );
};
