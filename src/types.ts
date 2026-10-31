export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Prediction {
  id: string;
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

export type UserRole = 'student' | 'dean';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
}

export type FeedbackRecord = Omit<Prediction, 'id'> & {
  id: number;
  student_id: number;
  student_email?: string;
};

export interface AdminSummary {
  total_feedback: number;
  total_students: number;
  sentiment_counts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trend: TrendPoint[];
}

export interface StudentRecord {
  id: number;
  email: string;
  created_at: string;
  feedback_count: number;
}

export type Page =
  | 'Overview'
  | 'Analyze Feedback'
  | 'Batch Analysis'
  | 'Model Evaluation'
  | 'Saved Analyses'
  | 'Settings'
  | 'Feedback Management'
  | 'Registered Students';

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
