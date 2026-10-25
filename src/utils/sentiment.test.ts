import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifySentiment,
  calculateConfidence,
  createDemoPrediction,
  parseCSVFeedback,
  splitCSVRow,
  exportBatchToCSV,
} from './sentiment';

test('classifySentiment correctly identifies positive sentiment', () => {
  const result = classifySentiment('The professor explains difficult concepts clearly and is very helpful');
  assert.equal(result.sentiment, 'positive');
  assert.ok(result.positiveMatches.includes('helpful') || result.positiveMatches.includes('clear'));
});

test('classifySentiment correctly identifies negative sentiment', () => {
  const result = classifySentiment('The lab equipment was broken and wifi disconnects constantly');
  assert.equal(result.sentiment, 'negative');
  assert.ok(result.negativeMatches.includes('broken') || result.negativeMatches.includes('disconnect'));
});

test('classifySentiment returns neutral when no keywords or equal count', () => {
  const result = classifySentiment('The lecture covered the planned topics on Wednesday');
  assert.equal(result.sentiment, 'neutral');
});

test('calculateConfidence returns reasonable bounds', () => {
  const conf1 = calculateConfidence('Great class!', 'positive', 1, 0);
  assert.ok(conf1 >= 0.60 && conf1 <= 0.95);

  const confNeutral = calculateConfidence('The class exists', 'neutral', 0, 0);
  assert.equal(confNeutral, 0.60);
});

test('createDemoPrediction creates valid prediction structure', () => {
  const pred = createDemoPrediction('The library is quiet and helpful.');
  assert.ok(pred.id.startsWith('pred-'));
  assert.equal(pred.sentiment, 'positive');
  assert.equal(pred.source, 'demo');
  assert.ok(pred.confidence >= 0.6);
});

test('splitCSVRow handles quoted commas and spaces', () => {
  const row = '"The professor was great, very clear",positive';
  const parts = splitCSVRow(row);
  assert.equal(parts.length, 2);
  assert.equal(parts[0], 'The professor was great, very clear');
  assert.equal(parts[1], 'positive');
});

test('parseCSVFeedback extracts texts correctly from CSV string', () => {
  const csv = `text,label
"The library is quiet and clean",positive
"The projector was broken",negative
"Classroom is average",neutral`;

  const parsed = parseCSVFeedback(csv);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].text, 'The library is quiet and clean');
  assert.equal(parsed[0].initialLabel, 'positive');
  assert.equal(parsed[1].text, 'The projector was broken');
  assert.equal(parsed[1].initialLabel, 'negative');
});

test('exportBatchToCSV formats valid CSV string', () => {
  const items = [
    { id: '1', text: 'Good work', sentiment: 'positive' as const, confidence: 0.85, source: 'demo' as const },
  ];
  const csv = exportBatchToCSV(items);
  assert.ok(csv.includes('predicted_sentiment'));
  assert.ok(csv.includes('"Good work",positive,85%,demo'));
});
