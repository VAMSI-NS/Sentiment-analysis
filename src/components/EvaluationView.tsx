import React, { useState } from 'react';
import { ILLUSTRATIVE_METRICS } from '../utils/sampleData';
import {
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  BarChart3,
  Cpu,
  BookOpen,
  Terminal,
  ShieldAlert,
} from 'lucide-react';

interface EvaluationViewProps {
  apiStatus: 'online' | 'offline' | 'checking';
  modelLoaded: boolean;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ apiStatus, modelLoaded }) => {
  const [checklist, setChecklist] = useState<boolean[]>([true, true, false, false, false]);

  const toggleCheck = (index: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const checklistItems = [
    {
      title: 'Curate a representative labeled dataset',
      desc: 'Collect balanced student reviews across multiple departments, instructors, and semesters.',
    },
    {
      title: 'Stratified train-test split (e.g., 80/20)',
      desc: 'Prevent data leakage by testing strictly on held-out reviews unseen during model fitting.',
    },
    {
      title: 'Report per-class precision, recall, and F1-score',
      desc: 'Overall accuracy hides severe minority-class failure (especially neutral or subtle complaints).',
    },
    {
      title: 'Analyze error cases & confusion matrix',
      desc: 'Inspect false positives and false negatives to identify ambiguous phrasing or domain slang.',
    },
    {
      title: 'Document dataset limitations & academic ethics',
      desc: 'Clearly disclose demo heuristics vs trained model inference in your capstone report.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">
          Model Governance & Validation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Model Evaluation & Metrics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Validate and understand your sentiment classification pipeline before reporting results in your academic capstone.
        </p>
      </div>

      {/* Critical Academic Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-950">Ethical AI Capstone Requirement:</span>
          <p className="text-amber-800 leading-relaxed">
            Never invent or misrepresent model accuracy. Dashboard KPI cards display illustrative estimates.
            To generate validated scientific numbers, run the included training pipeline on your labeled dataset and record the actual held-out test split results.
          </p>
        </div>
      </div>

      {/* Status & Architecture Two-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model & Backend Status */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-[#0f172a]">Live Pipeline Status</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-600 font-medium">FastAPI Backend Connection</span>
              <span
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  apiStatus === 'online'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {apiStatus === 'online' ? 'Connected (127.0.0.1:8000)' : 'Offline (Local Heuristic Fallback)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-slate-600 font-medium">Classifier Artifact (.joblib)</span>
              <span
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  modelLoaded
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {modelLoaded ? 'Loaded (sentiment_pipeline.joblib)' : 'Not Found (Using Keyword Heuristic)'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-900 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Pipeline Architecture:
              </span>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Raw Text → Lowercasing & Tokenization → TF-IDF Vectorizer (1-2 ngrams, sublinear TF) → Multinomial Logistic Regression / LinearSVC classifier.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics to Report Guide */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-[#0f172a]">Core Evaluation Metrics Guide</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
              <div className="font-bold text-slate-800">Accuracy</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Ratio of correct predictions over total feedback samples.
              </div>
              <code className="block mt-2 font-mono text-[10px] text-indigo-600 bg-white p-1 rounded border border-slate-200">
                (TP + TN) / Total
              </code>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
              <div className="font-bold text-slate-800">Precision</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Quality of positive/negative calls. Minimizes false accusations.
              </div>
              <code className="block mt-2 font-mono text-[10px] text-indigo-600 bg-white p-1 rounded border border-slate-200">
                TP / (TP + FP)
              </code>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
              <div className="font-bold text-slate-800">Recall</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Coverage of actual sentiment. Catches student grievances.
              </div>
              <code className="block mt-2 font-mono text-[10px] text-indigo-600 bg-white p-1 rounded border border-slate-200">
                TP / (TP + FN)
              </code>
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
              <div className="font-bold text-slate-800">F1-Score</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Harmonic mean of precision and recall. Best for imbalanced sets.
              </div>
              <code className="block mt-2 font-mono text-[10px] text-indigo-600 bg-white p-1 rounded border border-slate-200">
                2·(P·R) / (P+R)
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Illustrative Benchmark Results & Confusion Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">
              Illustrative Held-Out Test Metrics & Confusion Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Sample presentation format based on a hypothetical 840-comment test split
            </p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-mono">
            Sample Output
          </span>
        </div>

        {/* Per-class Metrics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 font-semibold">Class</th>
                <th className="py-2.5 px-3 font-semibold">Precision</th>
                <th className="py-2.5 px-3 font-semibold">Recall</th>
                <th className="py-2.5 px-3 font-semibold">F1-Score</th>
                <th className="py-2.5 px-3 font-semibold">Test Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ILLUSTRATIVE_METRICS.classes.map((c) => (
                <tr key={c.name} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{c.name}</td>
                  <td className="py-2.5 px-3 font-mono">{(c.precision * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 font-mono">{(c.recall * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                    {(c.f1 * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{c.support}</td>
                </tr>
              ))}
              <tr className="bg-slate-50/90 font-bold text-slate-900 border-t border-slate-200">
                <td className="py-2.5 px-3">Macro Average</td>
                <td className="py-2.5 px-3 font-mono">{(ILLUSTRATIVE_METRICS.precision * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 font-mono">{(ILLUSTRATIVE_METRICS.recall * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 font-mono text-indigo-700">
                  {(ILLUSTRATIVE_METRICS.macroF1 * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">840</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Confusion Matrix Table */}
        <div className="pt-3">
          <div className="text-xs font-bold text-slate-700 mb-2">Confusion Matrix Visualization:</div>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-2 border border-slate-200 text-left">Actual \ Predicted</th>
                  <th className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">Pred Positive</th>
                  <th className="p-2 border border-slate-200 text-center text-slate-700 font-bold">Pred Neutral</th>
                  <th className="p-2 border border-slate-200 text-center text-rose-700 font-bold">Pred Negative</th>
                </tr>
              </thead>
              <tbody>
                {ILLUSTRATIVE_METRICS.confusionMatrix.map((row) => (
                  <tr key={row.actual} className="text-center font-mono">
                    <td className="p-2 border border-slate-200 text-left font-bold text-slate-800 font-sans">
                      Actual {row.actual}
                    </td>
                    <td className={`p-2 border border-slate-200 ${row.actual === 'Positive' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600'}`}>
                      {row.predPositive}
                    </td>
                    <td className={`p-2 border border-slate-200 ${row.actual === 'Neutral' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'}`}>
                      {row.predNeutral}
                    </td>
                    <td className={`p-2 border border-slate-200 ${row.actual === 'Negative' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600'}`}>
                      {row.predNegative}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Capstone Validation Checklist */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-bold text-[#0f172a]">5-Step Capstone Validation Checklist</h2>
        </div>

        <div className="space-y-2.5">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                checklist[idx]
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="mt-0.5">
                {checklist[idx] ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  <span>Step {idx + 1}: {item.title}</span>
                  {checklist[idx] && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backend Training Terminal Codebox */}
      <div className="bg-slate-900 rounded-xl text-slate-200 p-5 shadow-lg space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px]">Backend Training Execution</span>
          </div>
          <span className="text-[10px]">Python 3.10+ / scikit-learn</span>
        </div>

        <div className="space-y-1 text-slate-300">
          <div className="text-slate-500"># 1. Install dependencies in backend/</div>
          <div className="text-indigo-400">pip install -r requirements.txt</div>
          <div className="text-slate-500 mt-2"># 2. Provide feedback.csv with columns: text,label</div>
          <div className="text-slate-500"># 3. Train the model pipeline and generate evaluation metrics:</div>
          <div className="text-emerald-400 font-bold">python -m app.train</div>
          <div className="text-slate-500 mt-2"># 4. Run the FastAPI development server on port 8000:</div>
          <div className="text-indigo-400">uvicorn app.main:app --reload --port 8000</div>
        </div>
      </div>
    </div>
  );
};
