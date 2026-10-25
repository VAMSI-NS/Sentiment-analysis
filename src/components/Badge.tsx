import React from 'react';
import { Sentiment } from '../types';
import { ThumbsUp, ThumbsDown, Minus, Cpu, Sparkles } from 'lucide-react';

interface BadgeProps {
  sentiment: Sentiment;
  size?: 'sm' | 'md' | 'lg';
}

export const SentimentBadge: React.FC<BadgeProps> = ({ sentiment, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  if (sentiment === 'positive') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <ThumbsUp className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
        <span className="capitalize">Positive</span>
      </span>
    );
  }

  if (sentiment === 'negative') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <ThumbsDown className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
        <span className="capitalize">Negative</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-xs ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <Minus className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      <span className="capitalize">Neutral</span>
    </span>
  );
};

export const SourceBadge: React.FC<{ source: 'model' | 'demo'; size?: 'sm' | 'md' }> = ({
  source,
  size = 'sm',
}) => {
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (source === 'model') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClass}`}
      >
        <Cpu className="w-3 h-3 text-indigo-600" />
        Trained Model
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200/90 ${sizeClass}`}
    >
      <Sparkles className="w-3 h-3 text-amber-600" />
      Demo Heuristic
    </span>
  );
};
