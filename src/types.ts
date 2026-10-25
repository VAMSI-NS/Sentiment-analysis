export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Prediction {
  id?: string;
  text: string;
  sentiment: Sentiment;
  confidence: number;
  source: 'model' | 'demo';
  timestamp?: string;
  wordCount?: number;
}

export interface BackendHealth {
  status: string;
  model_loaded: boolean;
  mode: string;
  timestamp?: string;
}

export type Page =
  | 'Overview'
  | 'Analyze Feedback'
  | 'Batch Analysis'
  | 'Model Evaluation'
  | 'Saved Analyses'
  | 'Settings';

export interface BatchItem {
  id: string;
  text: string;
  sentiment: Sentiment;
  confidence: number;
  source: 'model' | 'demo';
}

export interface TrendPoint {
  day: string;
  positive: number;
  neutral: number;
  negative: number;
}
