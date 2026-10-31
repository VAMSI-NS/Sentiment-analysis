import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { LogOut, MessageSquareText, RefreshCw, ShieldCheck } from 'lucide-react';
import { AuthUser, Prediction } from '../types';
import { getMyFeedback } from '../api';
import { SentimentBadge, SourceBadge } from './Badge';

const AnalyzeView = lazy(() => import('./AnalyzeView').then(({ AnalyzeView: View }) => ({ default: View })));

interface StudentDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [history, setHistory] = useState<Prediction[]>([]);
  const [view, setView] = useState<'submit' | 'history'>('submit');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshHistory = useCallback(async () => {
    try {
      setHistory(await getMyFeedback());
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load your feedback history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const handleSaved = () => {
    void refreshHistory();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base">Feedback<span className="text-indigo-600">AI</span></div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Student workspace</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-500 max-w-48 truncate">{user.email}</span>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <section className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Student dashboard</span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">Your feedback makes a difference.</h1>
            <p className="mt-2 text-sm text-indigo-100/85">Submit course or campus feedback and see its sentiment analysis.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <ShieldCheck className="w-5 h-5 text-indigo-200" />
            <div>
              <div className="text-lg font-extrabold">{history.length}</div>
              <div className="text-[10px] text-indigo-100/75">Your submissions</div>
            </div>
          </div>
        </section>

        <nav className="flex gap-2" aria-label="Student dashboard">
          <button
            type="button"
            onClick={() => setView('submit')}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${view === 'submit' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Submit feedback
          </button>
          <button
            type="button"
            onClick={() => {
              setView('history');
              void refreshHistory();
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${view === 'history' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            My submissions
          </button>
        </nav>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={() => void refreshHistory()} aria-label="Retry loading feedback">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {view === 'submit' ? (
          <Suspense fallback={<div className="min-h-64" role="status">Loading feedback form…</div>}>
            <AnalyzeView onSavePrediction={handleSaved} />
          </Suspense>
        ) : (
          <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-[#0f172a]">Your feedback history</h2>
              <p className="mt-1 text-xs text-slate-500">Only you can view the submissions associated with your account.</p>
            </div>
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-400" role="status">Loading your feedback…</div>
            ) : history.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-3 font-semibold">Feedback</th>
                      <th className="px-4 py-3 font-semibold">Sentiment</th>
                      <th className="px-4 py-3 font-semibold">Confidence</th>
                      <th className="px-4 py-3 font-semibold">Date submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 max-w-xl text-slate-700 leading-relaxed">{item.text}</td>
                        <td className="px-4 py-3"><SentimentBadge sentiment={item.sentiment} size="sm" /></td>
                        <td className="px-4 py-3 font-mono text-slate-600">{Math.round(item.confidence * 100)}%</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <SourceBadge source={item.source} size="sm" />
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold text-slate-700">No feedback submitted yet</p>
                <button type="button" onClick={() => setView('submit')} className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  Submit your first feedback
                </button>
              </div>
            )}
          </section>
        )}
      </main>
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400">
        FeedbackAI · Student Feedback Sentiment Analysis
      </footer>
    </div>
  );
};
