import React, { useState } from 'react';
import { getStoredApiUrl, setStoredApiUrl, checkBackendHealth, DEFAULT_API_BASE_URL, isGitHubPagesHost } from '../api';
import {
  Settings,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Save,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SettingsViewProps {
  apiStatus: 'online' | 'offline' | 'checking';
  modelLoaded: boolean;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  apiStatus,
  modelLoaded,
  onRefreshHealth,
}) => {
  const [apiUrl, setApiUrl] = useState(getStoredApiUrl());
  const isStaticGitHubPages = isGitHubPagesHost();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
    mode?: string;
  } | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setStoredApiUrl(apiUrl.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
    onRefreshHealth();
  };

  const handleReset = () => {
    setApiUrl(DEFAULT_API_BASE_URL);
    setStoredApiUrl(DEFAULT_API_BASE_URL);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
    onRefreshHealth();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const health = await checkBackendHealth(apiUrl.trim());
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: true,
        message: `Connected successfully! Mode: ${health.mode}, Model Loaded: ${health.model_loaded ? 'Yes' : 'No'}`,
        latency,
        mode: health.mode,
      });
      onRefreshHealth();
    } catch (err: unknown) {
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Unable to connect to backend server.',
        latency,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">
          System & Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Settings & Backend Integration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure API endpoints to connect this React frontend to your local or deployed Python FastAPI backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Configuration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-[#0f172a]">FastAPI Server Connection</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder={isStaticGitHubPages ? 'Enter your deployed FastAPI base URL' : 'Leave blank for Integrated Backend or http://127.0.0.1:8000'}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={handleReset}
                title="Reset to Integrated Backend"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Presets:</span>
              {!isStaticGitHubPages && (
                <button
                  type="button"
                  onClick={() => {
                    setApiUrl('');
                    setStoredApiUrl('');
                    setSavedNotice(true);
                    setTimeout(() => setSavedNotice(false), 2000);
                    onRefreshHealth();
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    apiUrl === ''
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Integrated Server
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setApiUrl('http://127.0.0.1:8000');
                  setStoredApiUrl('http://127.0.0.1:8000');
                  setSavedNotice(true);
                  setTimeout(() => setSavedNotice(false), 2000);
                  onRefreshHealth();
                }}
                className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                  apiUrl === 'http://127.0.0.1:8000'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🐍 Local Python FastAPI (127.0.0.1:8000)
              </button>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              {apiUrl.trim()
                ? `Configured to connect to external endpoint: ${apiUrl}`
                : isStaticGitHubPages
                  ? 'GitHub Pages hosts the frontend only. Enter your deployed FastAPI backend URL to enable model predictions.'
                  : 'Currently using the full-stack server running directly with this app.'}
            </p>
          </div>

          {savedNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>API Base URL preference saved.</span>
            </div>
          )}

          {/* Connection Test Action */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">Connection Diagnostics</div>
              <div className="text-[11px] text-slate-500">
                Ping the <code className="font-mono text-indigo-600">/health</code> endpoint to test latency.
              </div>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {testing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Pinging Server…</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Test Connection Now</span>
                </>
              )}
            </button>
          </div>

          {/* Test Result Callout */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                testResult.success
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{testResult.success ? 'Backend Reachable' : 'Connection Failed'}</span>
                {testResult.latency !== undefined && (
                  <span className="font-mono font-normal text-[10px] bg-white/70 px-1.5 py-0.5 rounded border">
                    {testResult.latency} ms
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
            </div>
          )}
        </div>

        {/* Right Column: Status & Setup Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current State Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#0f172a] pb-2 border-b border-slate-100">
              Active Environment State
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">API Status</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    apiStatus === 'online'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {apiStatus === 'online' ? 'Online' : 'Offline (Demo Mode)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Model Pipeline</span>
                <span className="font-semibold text-slate-800">
                  {modelLoaded ? 'Trained (.joblib loaded)' : 'Demo Heuristic'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Target Host</span>
                <code className="text-slate-700 font-mono text-[11px]">{apiUrl}</code>
              </div>
            </div>
          </div>

          {/* Backend Run Instructions */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>How to Run the Backend Locally:</span>
            </div>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
              <div className="text-slate-400"># Navigate to backend/</div>
              <div className="text-indigo-300">cd backend</div>
              <div className="text-slate-400 mt-1"># Run FastAPI with uvicorn</div>
              <div className="text-emerald-400">uvicorn app.main:app --reload --port 8000</div>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Interactive Swagger docs will be available at{' '}
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline font-mono inline-flex items-center gap-0.5"
              >
                127.0.0.1:8000/docs <ExternalLink className="w-2.5 h-2.5" />
              </a>
              .
            </p>
          </div>

          {/* Privacy & Compliance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Data Privacy & Security
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Student feedback is evaluated strictly within your active browser session or sent to your own local FastAPI endpoint. No data is stored externally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
