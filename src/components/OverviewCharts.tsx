import React from 'react';
import { TrendPoint } from '../types';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface OverviewChartsProps {
  trendData: TrendPoint[];
  sentimentCounts?: { positive: number; neutral: number; negative: number };
  totalFeedback?: number;
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '12px',
};

export default function OverviewCharts({ trendData, sentimentCounts, totalFeedback }: OverviewChartsProps) {
  const counts = sentimentCounts ?? { positive: 64, neutral: 23, negative: 13 };
  const total = totalFeedback ?? 1284;
  const pieData = [
    { name: 'Positive', value: counts.positive, color: '#10b981' },
    { name: 'Neutral', value: counts.neutral, color: '#94a3b8' },
    { name: 'Negative', value: counts.negative, color: '#f43f5e' },
  ];
  const percentage = (value: number) => total ? Math.round((value / total) * 100) : 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">Sentiment Overview</h2>
            <p className="text-xs text-slate-500">{sentimentCounts ? 'Feedback submitted during the last 7 days' : 'Illustrative weekly distribution across courses'}</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Positive</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Neutral</span>
            <span className="flex items-center gap-1.5 text-rose-500"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Negative</span>
          </div>
        </div>
        <div className="h-64 sm:h-72 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ ...tooltipStyle, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="positive" name="Positive" stroke="#10b981" strokeWidth={2} fill="url(#positiveGradient)" />
              <Area type="monotone" dataKey="neutral" name="Neutral" stroke="#94a3b8" strokeWidth={2} fill="transparent" />
              <Area type="monotone" dataKey="negative" name="Negative" stroke="#f43f5e" strokeWidth={2} fill="url(#negativeGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#0f172a]">Sentiment Split</h2>
            <p className="text-xs text-slate-500">{sentimentCounts ? 'Distribution from saved submissions' : 'Sample aggregated ratio'}</p>
          </div>
          <div className="h-48 sm:h-52 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={4}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-[#0f172a]">{total.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-medium">Comments</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
            <div className="text-[10px] text-emerald-700 font-medium">Positive</div>
            <div className="text-sm font-bold text-emerald-800">{percentage(counts.positive)}%</div>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-600 font-medium">Neutral</div>
            <div className="text-sm font-bold text-slate-800">{percentage(counts.neutral)}%</div>
          </div>
          <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-100">
            <div className="text-[10px] text-rose-700 font-medium">Negative</div>
            <div className="text-sm font-bold text-rose-800">{percentage(counts.negative)}%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
