import { Sentiment, Prediction, BatchItem } from '../types';

export const POSITIVE_KEYWORDS = [
  'excellent', 'great', 'good', 'helpful', 'clear', 'love', 'amazing',
  'comfortable', 'easy', 'supportive', 'best', 'enjoy', 'wonderful',
  'organized', 'quiet', 'friendly', 'engaging', 'manageable', 'structured',
  'inspiring', 'valuable', 'recommend', 'thorough', 'encouraging',
];

export const NEGATIVE_KEYWORDS = [
  'bad', 'poor', 'broken', 'late', 'slow', 'difficult', 'issue', 'problem',
  'disappointing', 'unclear', 'noisy', 'disconnect', 'worst', 'lack',
  'unavailable', 'crowded', 'frustrating', 'confusing', 'unprepared',
  'stressful', 'unfair', 'boring', 'unorganized', 'useless',
];

/**
 * Classifies text into positive, negative, or neutral based on keyword heuristic.
 * Used when Python FastAPI backend is not running or as client-side fallback.
 */
export function classifySentiment(text: string): { sentiment: Sentiment; positiveMatches: string[]; negativeMatches: string[] } {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', positiveMatches: [], negativeMatches: [] };
  }

  const clean = text.toLowerCase();
  const words = clean.match(/[a-z']+/g) || [];
  const wordSet = new Set(words);

  const posMatches: string[] = [];
  const negMatches: string[] = [];

  for (const w of POSITIVE_KEYWORDS) {
    if (wordSet.has(w) || clean.includes(w)) {
      posMatches.push(w);
    }
  }

  for (const w of NEGATIVE_KEYWORDS) {
    if (wordSet.has(w) || clean.includes(w)) {
      negMatches.push(w);
    }
  }

  const pCount = posMatches.length;
  const nCount = negMatches.length;

  let sentiment: Sentiment = 'neutral';
  if (pCount > nCount) {
    sentiment = 'positive';
  } else if (nCount > pCount) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    sentiment,
    positiveMatches: Array.from(new Set(posMatches)),
    negativeMatches: Array.from(new Set(negMatches)),
  };
}

/**
 * Generates an illustrative confidence score for demo predictions.
 */
export function calculateConfidence(text: string, sentiment: Sentiment, posMatches: number, negMatches: number): number {
  const wordCount = (text.match(/\S+/g) || []).length;
  const matchDiff = Math.abs(posMatches - negMatches);
  
  if (sentiment === 'neutral') {
    return 0.60;
  }
  
  // Base confidence with scaling based on keyword dominance and text length
  const base = 0.65;
  const matchBonus = Math.min(0.20, matchDiff * 0.06);
  const lengthBonus = Math.min(0.08, wordCount * 0.005);
  
  const total = base + matchBonus + lengthBonus;
  return Math.min(0.92, Math.max(0.60, Math.round(total * 100) / 100));
}

/**
 * Creates a demo prediction object.
 */
export function createDemoPrediction(text: string): Prediction {
  const { sentiment, positiveMatches, negativeMatches } = classifySentiment(text);
  const confidence = calculateConfidence(text, sentiment, positiveMatches.length, negativeMatches.length);
  const wordCount = (text.match(/\S+/g) || []).length;

  return {
    id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    text: text.trim(),
    sentiment,
    confidence,
    source: 'demo',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    wordCount,
  };
}

/**
 * Parses raw CSV string into an array of student feedback rows.
 * Supports standard headers: 'text', 'feedback', 'comment', or takes the first column.
 */
export function parseCSVFeedback(csvContent: string): { text: string; initialLabel?: string }[] {
  if (!csvContent || typeof csvContent !== 'string') return [];

  const rawLines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) return [];

  // Parse header
  const headerLine = rawLines[0].toLowerCase();
  const headers = splitCSVRow(headerLine);
  
  let textIndex = 0;
  let labelIndex = -1;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].replace(/["']/g, '').trim();
    if (h === 'text' || h === 'feedback' || h === 'comment' || h === 'student_feedback' || h === 'review') {
      textIndex = i;
    }
    if (h === 'label' || h === 'sentiment' || h === 'target') {
      labelIndex = i;
    }
  }

  // If first line was header, slice(1), otherwise keep
  const hasHeader = headers.some(h => ['text', 'feedback', 'comment', 'label', 'sentiment'].includes(h.replace(/["']/g, '').trim()));
  const dataLines = hasHeader ? rawLines.slice(1) : rawLines;

  const results: { text: string; initialLabel?: string }[] = [];

  for (const line of dataLines) {
    const cols = splitCSVRow(line);
    const textVal = cols[textIndex]?.replace(/^"|"$/g, '').trim();
    const labelVal = labelIndex >= 0 ? cols[labelIndex]?.replace(/^"|"$/g, '').trim() : undefined;

    if (textVal && textVal.length > 0) {
      results.push({
        text: textVal,
        initialLabel: labelVal,
      });
    }
  }

  return results;
}

/**
 * Splits a CSV row respecting double quotes.
 */
export function splitCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Converts batch items to a downloadable CSV string.
 */
export function exportBatchToCSV(items: BatchItem[]): string {
  const header = 'id,text,predicted_sentiment,confidence,source\n';
  const rows = items.map(item => {
    const escapedText = `"${item.text.replace(/"/g, '""')}"`;
    return `${item.id},${escapedText},${item.sentiment},${Math.round(item.confidence * 100)}%,${item.source}`;
  });
  return header + rows.join('\n');
}
