import React, { useState } from 'react';
import { BatchItem, Sentiment } from '../types';
import { SentimentBadge, SourceBadge } from './Badge';
import { SAMPLE_STUDENT_FEEDBACK } from '../utils/sampleData';
import { classifySentiment, calculateConfidence, exportBatchToCSV, parseCSVFeedback } from '../utils/sentiment';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const BatchView: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [filter, setFilter] = useState<'all' | Sentiment>('all');
  const [search, setSearch] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const processRows = (rawRows: { text: string; initialLabel?: string }[]) => {
    const processed: BatchItem[] = rawRows.map((r, i) => {
      const { sentiment, positiveMatches, negativeMatches } = classifySentiment(r.text);
      const confidence = calculateConfidence(r.text, sentiment, positiveMatches.length, negativeMatches.length);

      return {
        id: `row-${i + 1}`,
        text: r.text,
        sentiment: (r.initialLabel as Sentiment) || sentiment,
        confidence,
        source: 'demo',
      };
    });

    setItems(processed);
    setNotice(`Successfully processed ${processed.length} student feedback comments.`);
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setNotice('Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result || '');
      const parsed = parseCSVFeedback(content);
      if (parsed.length === 0) {
        setNotice('Could not find feedback text rows in the uploaded CSV.');
        return;
      }
      processRows(parsed);
    };
    reader.readAsText(file);
  };

  const loadSampleDataset = () => {
    processRows(SAMPLE_STUDENT_FEEDBACK.map(s => ({ text: s.text, initialLabel: s.label })));
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const csvContent = exportBatchToCSV(items);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-feedback-sentiment-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter and search
  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === 'all' || item.sentiment === filter;
    const matchesSearch = item.text.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const posCount = items.filter((i) => i.sentiment === 'positive').length;
  const neuCount = items.filter((i) => i.sentiment === 'neutral').length;
  const negCount = items.filter((i) => i.sentiment === 'negative').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">
          Dataset Processing
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Batch Feedback Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload student feedback in bulk via CSV, or explore with our built-in 18-comment dataset.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          handleFileUpload(file);
        }}
        className={`bg-white rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/30'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">
              Drop your student feedback CSV here
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard column headers like <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">text</code> or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">feedback</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Choose CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden"
              />
            </label>

            <button
              onClick={loadSampleDataset}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Built-in Sample (18 Rows)</span>
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Batch Stats Summary Cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Rows</span>
            <div className="text-2xl font-extrabold text-[#0f172a] mt-1">{items.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Processed feedback</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Positive</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {posCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({Math.round((posCount / items.length) * 100)}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Favorable reviews</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Neutral</span>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">
              {neuCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({Math.round((neuCount / items.length) * 100)}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Standard comments</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Negative</span>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {negCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({Math.round((negCount / items.length) * 100)}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Needs intervention</div>
          </div>
        </div>
      )}

      {/* Table & Controls Section */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(['all', 'positive', 'neutral', 'negative'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                    filter === s
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {s} {s === 'all' ? `(${items.length})` : s === 'positive' ? `(${posCount})` : s === 'neutral' ? `(${neuCount})` : `(${negCount})`}
                </button>
              ))}
            </div>

            {/* Search and Export */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search comments…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4 font-semibold w-12">#</th>
                  <th className="py-2.5 px-4 font-semibold">Student Feedback Text</th>
                  <th className="py-2.5 px-4 font-semibold w-32">Sentiment</th>
                  <th className="py-2.5 px-4 font-semibold w-24">Confidence</th>
                  <th className="py-2.5 px-4 font-semibold w-28">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium leading-relaxed max-w-xl">
                      "{item.text}"
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SentimentBadge sentiment={item.sentiment} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-slate-700">
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SourceBadge source={item.source} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No feedback comments matching "{search}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
