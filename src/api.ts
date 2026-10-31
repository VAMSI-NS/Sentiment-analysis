import { AdminSummary, AuthUser, BackendHealth, FeedbackRecord, Prediction, Sentiment, StudentRecord, UserRole } from './types';

export const DEFAULT_API_BASE_URL = '';
export const LOCAL_FASTAPI_URL = 'http://127.0.0.1:8000';

export function isGitHubPagesHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');
}

export function getStoredApiUrl(): string {
  try {
    const custom = localStorage.getItem('feedbackai_api_url');
    if (custom !== null) return custom;
  } catch {
    // ignore
  }
  return (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_API_BASE_URL;
}

export function setStoredApiUrl(url: string): void {
  try {
    localStorage.setItem('feedbackai_api_url', url);
  } catch {
    // ignore
  }
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const targetBase = getStoredApiUrl().trim().replace(/\/+$/, '');
  const endpoint = `${targetBase}${path}`;
  const response = await fetch(endpoint, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const error = await response.json();
      if (typeof error.detail === 'string') message = error.detail;
    } catch {
      // Keep the HTTP status as the actionable error when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiRequest(path, init);
  return response.json() as Promise<T>;
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiJson<AuthUser>('/api/auth/me');
}

export function login(email: string, password: string, role: UserRole): Promise<AuthUser> {
  return apiJson<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export function registerStudent(email: string, password: string): Promise<AuthUser> {
  return apiJson<AuthUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
}

export function getMyFeedback(): Promise<Prediction[]> {
  return apiJson<Array<Omit<Prediction, 'id'> & { id: number }>>('/api/feedback/mine')
    .then((records) => records.map((record) => ({ ...record, id: String(record.id) })));
}

export function getAdminSummary(): Promise<AdminSummary> {
  return apiJson<AdminSummary>('/api/admin/summary');
}

export function getAdminFeedback(options: {
  search?: string;
  sentiment?: Sentiment | 'all';
  limit?: number;
  offset?: number;
} = {}): Promise<{ total: number; items: FeedbackRecord[] }> {
  const query = new URLSearchParams();
  if (options.search) query.set('search', options.search);
  if (options.sentiment && options.sentiment !== 'all') query.set('sentiment', options.sentiment);
  if (options.limit !== undefined) query.set('limit', String(options.limit));
  if (options.offset !== undefined) query.set('offset', String(options.offset));
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return apiJson<{ total: number; items: FeedbackRecord[] }>(`/api/admin/feedback${suffix}`);
}

export function getAdminStudents(options: { limit?: number; offset?: number } = {}): Promise<{ total: number; items: StudentRecord[] }> {
  const query = new URLSearchParams();
  if (options.limit !== undefined) query.set('limit', String(options.limit));
  if (options.offset !== undefined) query.set('offset', String(options.offset));
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return apiJson<{ total: number; items: StudentRecord[] }>(`/api/admin/students${suffix}`);
}

/**
 * Checks health of FastAPI or integrated backend.
 */
export async function checkBackendHealth(baseUrl?: string): Promise<BackendHealth> {
  const targetBase = baseUrl !== undefined ? baseUrl : getStoredApiUrl();
  const url = targetBase.replace(/\/+$/, '');
  if (!url && isGitHubPagesHost()) {
    throw new Error('GitHub Pages only hosts the frontend. Configure a deployed FastAPI URL to check backend health.');
  }
  const endpoint = url ? `${url}/health` : '/health';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      status: data.status || 'ok',
      model_loaded: Boolean(data.model_loaded),
      mode: data.mode || (data.model_loaded ? 'trained_model' : 'demo_fallback'),
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Sends feedback text to /api/predict endpoint.
 */
export async function predictFeedback(text: string, baseUrl?: string): Promise<Prediction> {
  const targetBase = baseUrl !== undefined ? baseUrl : getStoredApiUrl();
  const url = targetBase.replace(/\/+$/, '');
  const endpoint = url ? `${url}/api/predict` : '/api/predict';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`API prediction failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return {
      id: `pred-api-${Date.now()}`,
      ...(typeof data.id === 'number' ? { id: String(data.id) } : {}),
      text: data.text || text,
      sentiment: data.sentiment || 'neutral',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0.70,
      source: data.source === 'model' ? 'model' : 'demo',
      timestamp: data.timestamp
        ? new Date(data.timestamp).toLocaleString()
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wordCount: (text.match(/\S+/g) || []).length,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}
