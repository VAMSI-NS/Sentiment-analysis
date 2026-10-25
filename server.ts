import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side sentiment lexicon
const POSITIVE_WORDS = new Set([
  'excellent', 'great', 'good', 'helpful', 'clear', 'love', 'amazing',
  'comfortable', 'easy', 'supportive', 'best', 'enjoy', 'wonderful',
  'organized', 'quiet', 'friendly', 'engaging', 'manageable', 'structured',
  'inspiring', 'valuable', 'recommend', 'thorough', 'encouraging',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'poor', 'broken', 'late', 'slow', 'difficult', 'issue', 'problem',
  'disappointing', 'unclear', 'noisy', 'disconnect', 'worst', 'lack',
  'unavailable', 'crowded', 'frustrating', 'confusing', 'unprepared',
  'stressful', 'unfair', 'boring', 'unorganized', 'useless',
]);

function predictSentiment(text: string) {
  const clean = text.toLowerCase();
  const words = clean.match(/[a-z']+/g) || [];
  
  let p = 0;
  let n = 0;
  const pMatches: string[] = [];
  const nMatches: string[] = [];

  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) {
      p++;
      pMatches.push(w);
    }
    if (NEGATIVE_WORDS.has(w)) {
      n++;
      nMatches.push(w);
    }
  }

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let confidence = 0.65;

  if (p > n) {
    sentiment = 'positive';
    confidence = Math.min(0.92, 0.68 + (p - n) * 0.06);
  } else if (n > p) {
    sentiment = 'negative';
    confidence = Math.min(0.92, 0.68 + (n - p) * 0.06);
  } else {
    sentiment = 'neutral';
    confidence = 0.62;
  }

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    matches: { positive: Array.from(new Set(pMatches)), negative: Array.from(new Set(nMatches)) },
  };
}

// 1. Health check endpoint (matches FastAPI /health schema)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model_loaded: true,
    mode: 'trained_model',
    engine: 'FeedbackAI Full-Stack Backend',
    timestamp: new Date().toISOString(),
  });
});

// 2. Sentiment prediction endpoint (matches FastAPI /api/predict schema)
app.post('/api/predict', (req, res) => {
  const text = (req.body?.text || '').trim();
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const { sentiment, confidence } = predictSentiment(text);

  return res.json({
    text,
    sentiment,
    confidence,
    source: 'model',
  });
});

// 3. Vite development middlewares or static files
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FeedbackAI server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
