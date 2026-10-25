import { Prediction, BackendHealth } from './types';

export const DEFAULT_API_BASE_URL = '';
export const LOCAL_FASTAPI_URL = 'http://127.0.0.1:8000';

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

/**
 * Checks health of FastAPI or integrated backend.
 */
export async function checkBackendHealth(baseUrl?: string): Promise<BackendHealth> {
  const targetBase = baseUrl !== undefined ? baseUrl : getStoredApiUrl();
  const url = targetBase.replace(/\/+$/, '');
  const endpoint = url ? `${url}/health` : '/health';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
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
      text: data.text || text,
      sentiment: data.sentiment || 'neutral',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0.70,
      source: data.source === 'model' ? 'model' : 'demo',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wordCount: (text.match(/\S+/g) || []).length,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}
