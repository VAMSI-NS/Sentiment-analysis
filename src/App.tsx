import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Page, Prediction, TrendPoint } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
const AnalyzeView = lazy(() => import('./components/AnalyzeView').then(({ AnalyzeView }) => ({ default: AnalyzeView })));
const BatchView = lazy(() => import('./components/BatchView').then(({ BatchView }) => ({ default: BatchView })));
const EvaluationView = lazy(() => import('./components/EvaluationView').then(({ EvaluationView }) => ({ default: EvaluationView })));
const SavedView = lazy(() => import('./components/SavedView').then(({ SavedView }) => ({ default: SavedView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(({ SettingsView }) => ({ default: SettingsView })));
import { INITIAL_PREDICTIONS, WEEKLY_TREND } from './utils/sampleData';
import { checkBackendHealth, getStoredApiUrl, isGitHubPagesHost } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('Overview');
  const [history, setHistory] = useState<Prediction[]>(INITIAL_PREDICTIONS);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>(() =>
    isGitHubPagesHost() && !getStoredApiUrl().trim() ? 'offline' : 'checking',
  );
  const [modelLoaded, setModelLoaded] = useState(false);
  const [trendData] = useState<TrendPoint[]>(WEEKLY_TREND);

  const fetchHealth = useCallback(async () => {
    if (isGitHubPagesHost() && !getStoredApiUrl().trim()) {
      setApiStatus('offline');
      setModelLoaded(false);
      return;
    }
    setApiStatus('checking');
    try {
      const data = await checkBackendHealth();
      setApiStatus('online');
      setModelLoaded(data.model_loaded);
    } catch {
      setApiStatus('offline');
      setModelLoaded(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleSavePrediction = (pred: Prediction) => {
    setHistory((prev) => [pred, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          apiStatus={apiStatus}
          modelLoaded={modelLoaded}
          historyCount={history.length}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          apiStatus={apiStatus}
          modelLoaded={modelLoaded}
          historyCount={history.length}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentPage === 'Overview' && (
            <OverviewView
              onNavigate={setCurrentPage}
              trendData={trendData}
              recentFeedback={history}
              modelLoaded={modelLoaded}
              apiStatus={apiStatus}
            />
          )}

          <Suspense fallback={<div className="min-h-64" role="status">Loading view…</div>}>
            {currentPage === 'Analyze Feedback' && (
              <AnalyzeView onSavePrediction={handleSavePrediction} apiStatus={apiStatus} />
            )}
            {currentPage === 'Batch Analysis' && <BatchView />}
            {currentPage === 'Model Evaluation' && (
              <EvaluationView apiStatus={apiStatus} modelLoaded={modelLoaded} />
            )}
            {currentPage === 'Saved Analyses' && (
              <SavedView history={history} onClearHistory={handleClearHistory} onNavigate={setCurrentPage} />
            )}
            {currentPage === 'Settings' && (
              <SettingsView apiStatus={apiStatus} modelLoaded={modelLoaded} onRefreshHealth={fetchHealth} />
            )}
          </Suspense>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">FeedbackAI</span>
            <span>·</span>
            <span>Student Feedback Sentiment Analysis Capstone</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-slate-600 font-medium">
                {apiStatus === 'online' ? 'FastAPI Reachable' : 'Demo Fallback'}
              </span>
            </span>
            <span>·</span>
            <button
              onClick={() => setCurrentPage('Model Evaluation')}
              className="text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              Model Status & Docs
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
