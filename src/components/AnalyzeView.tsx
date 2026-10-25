import React, { useState } from 'react';
import { Prediction } from '../types';
import { SentimentBadge, SourceBadge } from './Badge';
import { SUGGESTED_EXAMPLES } from '../utils/sampleData';
import { classifySentiment, createDemoPrediction } from '../utils/sentiment';
import { predictFeedback } from '../api';
import {
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  CornerDownLeft,
  Share2,
} from 'lucide-react';

interface AnalyzeViewProps {
  onSavePrediction: (pred: Prediction) => void;
  apiStatus: 'online' | 'offline' | 'checking';
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({ onSavePrediction, apiStatus }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<Prediction | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [copied, setCopied] = useState(false);
  const [keywordMatches, setKeywordMatches] = useState<{ positive: string[]; negative: string[] }>({
    positive: [],
    negative: [],
  });

  const wordCount = (text.match(/\S+/g) || []).length;
  const charCount = text.length;

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setNotice({ text: 'Please enter a student feedback comment first.', type: 'error' });
      return;
    }

    setBusy(true);
    setNotice(null);

    // Compute keyword matches for educational transparency
    const matchAnalysis = classifySentiment(trimmed);
    setKeywordMatches({
      positive: matchAnalysis.positiveMatches,
      negative: matchAnalysis.negativeMatches,
    });

    try {
      let pred: Prediction;
      if (apiStatus === 'online') {
        pred = await predictFeedback(trimmed);
        setNotice({
          text: pred.source === 'model'
            ? 'Prediction calculated by the FastAPI trained scikit-learn model.'
            : 'FastAPI connected; returned demo prediction response.',
          type: 'success',
        });
      } else {
        pred = createDemoPrediction(trimmed);
        setNotice({
          text: 'Backend offline: Generated via local browser sentiment heuristic.',
          type: 'info',
        });
      }

      setResult(pred);
      onSavePrediction(pred);
    } catch {
      // Graceful fallback to client demo heuristic
      const fallbackPred = createDemoPrediction(trimmed);
      setResult(fallbackPred);
      onSavePrediction(fallbackPred);
      setNotice({
        text: 'FastAPI unreachable: Classification computed via local browser heuristic.',
        type: 'info',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">
          Sentiment Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Analyze Student Feedback
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Paste any student evaluation comment to classify sentiment. Demo predictions are clearly labeled.
        </p>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="feedback-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Feedback Text
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {wordCount} words · {charCount} chars
            </span>
          </div>

          <div className="relative">
            <textarea
              id="feedback-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. The professor explains difficult concepts clearly and the practical sessions are very helpful..."
              rows={6}
              className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none transition-all leading-relaxed"
            />
            {text && (
              <button
                onClick={() => setText('')}
                className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Examples */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Try a sample feedback comment:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_EXAMPLES.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setText(example)}
                  className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-colors"
                >
                  {example.length > 55 ? example.substring(0, 55) + '…' : example}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleAnalyze}
              disabled={busy}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Classifying Sentiment…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Sentiment</span>
                </>
              )}
            </button>
          </div>

          {/* Notification notice banner */}
          {notice && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                notice.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : notice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{notice.text}</span>
            </div>
          )}
        </div>

        {/* Right Column: Result Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-[#0f172a]">Analysis Result</h2>
              {result && (
                <button
                  onClick={handleCopyJson}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Predicted sentiment row */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Predicted Sentiment</span>
                    <SentimentBadge sentiment={result.sentiment} size="lg" />
                  </div>

                  {/* Confidence meter */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">Confidence Estimate</span>
                      <span className="font-bold text-[#0f172a] font-mono">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          result.sentiment === 'positive'
                            ? 'bg-emerald-500'
                            : result.sentiment === 'negative'
                            ? 'bg-rose-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.round(result.confidence * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Classification Source</span>
                    <SourceBadge source={result.source} />
                  </div>
                </div>

                {/* Quoted input */}
                <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 italic relative">
                  "{result.text}"
                </div>

                {/* Keyword match transparency */}
                {(keywordMatches.positive.length > 0 || keywordMatches.negative.length > 0) && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Detected Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {keywordMatches.positive.map((w) => (
                        <span
                          key={`pos-${w}`}
                          className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[11px]"
                        >
                          +{w}
                        </span>
                      ))}
                      {keywordMatches.negative.map((w) => (
                        <span
                          key={`neg-${w}`}
                          className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium text-[11px]"
                        >
                          -{w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic disclaimer box */}
                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Model Context: </span>
                  {result.source === 'demo' ? (
                    <span>
                      Demo mode heuristic output. To calibrate true model probabilities, run{' '}
                      <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">
                        python -m app.train
                      </code>{' '}
                      in the backend folder.
                    </span>
                  ) : (
                    <span>Returned from FastAPI Scikit-learn inference pipeline.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 text-sm">Your insight appears here</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Type a comment on the left and click Analyze Sentiment to test classification.
                  </p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Saved to Session History</span>
              <span className="font-mono">{result.timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
