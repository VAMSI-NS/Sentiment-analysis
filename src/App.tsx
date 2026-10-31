import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Page, Prediction, TrendPoint, AuthUser, UserRole, AdminSummary, FeedbackRecord } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminOverview } from './components/AdminOverview';
import { FeedbackManagementView } from './components/FeedbackManagementView';
import { RegisteredStudentsView } from './components/RegisteredStudentsView';
const AnalyzeView = lazy(() => import('./components/AnalyzeView').then(({ AnalyzeView }) => ({ default: AnalyzeView })));
const BatchView = lazy(() => import('./components/BatchView').then(({ BatchView }) => ({ default: BatchView })));
const EvaluationView = lazy(() => import('./components/EvaluationView').then(({ EvaluationView }) => ({ default: EvaluationView })));
const SavedView = lazy(() => import('./components/SavedView').then(({ SavedView }) => ({ default: SavedView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(({ SettingsView }) => ({ default: SettingsView })));
import { WEEKLY_TREND } from './utils/sampleData';
import {
  checkBackendHealth,
  getAdminFeedback,
  getAdminSummary,
  getCurrentUser,
  getStoredApiUrl,
  isGitHubPagesHost,
  login,
  logout,
  registerStudent,
} from './api';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('Overview');
  const [history, setHistory] = useState<Prediction[]>([]);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [trendData] = useState<TrendPoint[]>(WEEKLY_TREND);
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackRecord[]>([]);
  const [adminDataError, setAdminDataError] = useState('');
  const [loadingAdminData, setLoadingAdminData] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof Error && !/sign in|session has expired/i.test(error.message)) {
          setAuthError(`Could not connect to the authentication service: ${error.message}`);
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const fetchHealth = useCallback(async () => {
    if (isGitHubPagesHost() && !getStoredApiUrl().trim()) {
      setApiStatus('offline');
      setModelLoaded(false);
      return;
    }
    setApiStatus('checking');
    try {
      const data = await checkBackendHealth();
      setApiStatus(data.status === 'ok' ? 'online' : 'offline');
      setModelLoaded(data.model_loaded);
    } catch {
      setApiStatus('offline');
      setModelLoaded(false);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchHealth();
  }, [fetchHealth, user]);

  const fetchAdminData = useCallback(async () => {
    setLoadingAdminData(true);
    try {
      const [summary, feedback] = await Promise.all([
        getAdminSummary(),
        getAdminFeedback({ limit: 6 }),
      ]);
      setAdminSummary(summary);
      setRecentFeedback(feedback.items);
      setAdminDataError('');
    } catch (error) {
      setAdminDataError(error instanceof Error ? error.message : 'Could not load administrative data.');
    } finally {
      setLoadingAdminData(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'dean') void fetchAdminData();
  }, [fetchAdminData, user]);

  const handleAuthenticate = async (
    email: string,
    password: string,
    role: UserRole,
    createAccount: boolean,
  ): Promise<AuthUser> => {
    setAuthError(null);
    const authenticatedUser = createAccount
      ? await registerStudent(email, password)
      : await login(email, password, role);

    if (authenticatedUser.role !== role) {
      throw new Error('The server returned a role that does not match the selected workspace.');
    }

    setUser(authenticatedUser);
    setCurrentPage('Overview');
    return authenticatedUser;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAdminSummary(null);
      setRecentFeedback([]);
      setHistory([]);
      setCurrentPage('Overview');
      setAuthError(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign out failed. Please try again.');
    }
  };

  const handleSavePrediction = (prediction: Prediction) => {
    setHistory((previous) => [prediction, ...previous]);
    if (user?.role === 'dean') void fetchAdminData();
  };

  const handleClearHistory = () => setHistory([]);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-sm text-slate-500" role="status">Connecting to FeedbackAI…</div>
      </main>
    );
  }

  if (!user) {
    return <LoginPage backendError={authError} onAuthenticate={handleAuthenticate} />;
  }

  if (user.role === 'student') {
    return <StudentDashboard user={user} onLogout={() => void handleLogout()} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="hidden md:block">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          apiStatus={apiStatus}
          modelLoaded={modelLoaded}
          historyCount={history.length}
          onLogout={() => void handleLogout()}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          apiStatus={apiStatus}
          modelLoaded={modelLoaded}
          historyCount={history.length}
          userEmail={user.email}
          onLogout={() => void handleLogout()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {authError && (
            <div role="alert" className="max-w-7xl mx-auto mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}
          {adminDataError && (
            <div role="alert" className="max-w-7xl mx-auto mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {adminDataError}
              <button type="button" className="underline" onClick={() => void fetchAdminData()}>Retry</button>
            </div>
          )}
          {loadingAdminData && !adminSummary && (
            <div className="max-w-7xl mx-auto mb-4 text-xs text-slate-500" role="status">Loading database dashboard…</div>
          )}

          {currentPage === 'Overview' && (
            adminSummary ? (
              <AdminOverview summary={adminSummary} recentFeedback={recentFeedback} onNavigate={setCurrentPage} />
            ) : !loadingAdminData ? (
              <div className="max-w-7xl mx-auto rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Administrative dashboard data is unavailable.
              </div>
            ) : null
          )}

          <Suspense fallback={<div className="min-h-64" role="status">Loading view…</div>}>
            {currentPage === 'Analyze Feedback' && (
              <AnalyzeView onSavePrediction={handleSavePrediction} />
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
            {currentPage === 'Feedback Management' && <FeedbackManagementView />}
            {currentPage === 'Registered Students' && <RegisteredStudentsView />}
          </Suspense>
        </main>

        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">FeedbackAI</span>
            <span>·</span>
            <span>Student Feedback Sentiment Analysis</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-slate-600 font-medium">{apiStatus === 'online' ? 'Backend connected' : 'Backend unavailable'}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
