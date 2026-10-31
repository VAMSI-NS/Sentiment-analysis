import React, { useEffect, useState } from 'react';
import { AlertCircle, Search, X } from 'lucide-react';
import { FeedbackRecord, Sentiment } from '../types';
import { getAdminFeedback } from '../api';
import { SentimentBadge, SourceBadge } from './Badge';

export const FeedbackManagementView: React.FC = () => {
  const pageSize = 50;
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Sentiment>('all');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<FeedbackRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      getAdminFeedback({ search, sentiment: filter, limit: pageSize, offset })
        .then((result) => {
          if (!active) return;
          setRecords(result.items);
          setTotal(result.total);
          setError('');
        })
        .catch((requestError: unknown) => {
          if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load feedback.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, filter, offset]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">Administration</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">Feedback management</h1>
        <p className="text-sm text-slate-500 mt-1">Search, filter, and review database submissions from students.</p>
      </div>

      {error && <div role="alert" className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-800 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              aria-label="Search feedback or student email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOffset(0);
              }}
              placeholder="Search feedback or student email"
              maxLength={200}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'positive', 'neutral', 'negative'] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setFilter(value);
                  setOffset(0);
                }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${filter === value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-2.5 text-xs text-slate-500 border-b border-slate-100">{total.toLocaleString()} matching submissions</div>
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400" role="status">Loading feedback records…</div>
        ) : records.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-semibold">Feedback</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Sentiment</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 max-w-sm">
                      <button type="button" onClick={() => setSelected(item)} className="text-left text-slate-700 hover:text-indigo-700 line-clamp-2">
                        {item.text}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.student_email}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><SentimentBadge sentiment={item.sentiment} size="sm" /></td>
                    <td className="px-4 py-3 font-mono text-slate-600">{Math.round(item.confidence * 100)}%</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-slate-400">No feedback matches these filters.</div>
        )}
        {total > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {offset + 1}–{Math.min(offset + pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - pageSize))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={offset + pageSize >= total}
                onClick={() => setOffset(offset + pageSize)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4 flex items-center justify-center" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="feedback-detail-title" className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-600">Feedback detail</div>
                <h2 id="feedback-detail-title" className="mt-1 text-lg font-bold text-slate-900">Submission #{selected.id}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close feedback detail" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap">{selected.text}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
              <div><dt className="text-slate-400">Student</dt><dd className="mt-1 font-medium text-slate-700">{selected.student_email}</dd></div>
              <div><dt className="text-slate-400">Submitted</dt><dd className="mt-1 font-medium text-slate-700">{selected.timestamp ? new Date(selected.timestamp).toLocaleString() : '—'}</dd></div>
              <div><dt className="text-slate-400">Sentiment</dt><dd className="mt-1"><SentimentBadge sentiment={selected.sentiment} size="sm" /></dd></div>
              <div><dt className="text-slate-400">Confidence · source</dt><dd className="mt-1 flex items-center gap-2 font-medium text-slate-700">{Math.round(selected.confidence * 100)}% <SourceBadge source={selected.source} size="sm" /></dd></div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
};
