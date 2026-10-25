import { TrendPoint, Prediction } from '../types';

export const SAMPLE_STUDENT_FEEDBACK: { text: string; label: 'positive' | 'neutral' | 'negative' }[] = [
  { text: "The professor explains difficult concepts clearly and answers all our questions patiently.", label: "positive" },
  { text: "The laboratory computers work well, and the high-speed network is easy to use.", label: "positive" },
  { text: "The library is quiet, comfortable, and the staff are extremely helpful with research materials.", label: "positive" },
  { text: "I enjoy practical sessions because they are engaging, structured, and hands-on.", label: "positive" },
  { text: "The faculty is supportive and provides thorough feedback on all assignments.", label: "positive" },
  { text: "The course materials are well-organized, comprehensive, and very useful for exam prep.", label: "positive" },
  { text: "The classroom projector is broken and displays distorted colors during lectures.", label: "negative" },
  { text: "The Wi-Fi disconnects frequently during online lectures, causing missed notes.", label: "negative" },
  { text: "The timetable changes too often without prior notice, causing serious schedule confusion.", label: "negative" },
  { text: "The lab equipment is unavailable when we need it for our graded coursework.", label: "negative" },
  { text: "The assignment instructions are unclear and rubric requirements were posted late.", label: "negative" },
  { text: "The lecture started 20 minutes late and the classroom air conditioning was noisy and disruptive.", label: "negative" },
  { text: "The course is okay overall, covers the basic syllabus as expected.", label: "neutral" },
  { text: "The timetable is manageable and fits well with other department schedules.", label: "neutral" },
  { text: "The midterm assignment was neither easy nor difficult, fairly balanced.", label: "neutral" },
  { text: "The lecture covered the planned topics from the textbook syllabus.", label: "neutral" },
  { text: "The classroom is average and has basic standard seating facilities.", label: "neutral" },
  { text: "The course has some useful practical parts and some ordinary theoretical sections.", label: "neutral" },
];

export const WEEKLY_TREND: TrendPoint[] = [
  { day: 'Mon', positive: 42, neutral: 18, negative: 15 },
  { day: 'Tue', positive: 48, neutral: 20, negative: 12 },
  { day: 'Wed', positive: 45, neutral: 23, negative: 18 },
  { day: 'Thu', positive: 57, neutral: 19, negative: 14 },
  { day: 'Fri', positive: 62, neutral: 22, negative: 11 },
  { day: 'Sat', positive: 55, neutral: 25, negative: 16 },
  { day: 'Sun', positive: 69, neutral: 21, negative: 10 },
];

export const INITIAL_PREDICTIONS: Prediction[] = [
  {
    id: 'pred-init-1',
    text: 'The faculty explains concepts clearly and the lab facilities are excellent.',
    sentiment: 'positive',
    confidence: 0.88,
    source: 'demo',
    timestamp: 'Today, 10:14 AM',
    wordCount: 11,
  },
  {
    id: 'pred-init-2',
    text: 'Wi-Fi disconnects frequently during online lab sessions and projector flickers.',
    sentiment: 'negative',
    confidence: 0.82,
    source: 'demo',
    timestamp: 'Today, 09:45 AM',
    wordCount: 10,
  },
  {
    id: 'pred-init-3',
    text: 'The course schedule is manageable and textbook readings are standard.',
    sentiment: 'neutral',
    confidence: 0.60,
    source: 'demo',
    timestamp: 'Yesterday, 04:20 PM',
    wordCount: 10,
  },
  {
    id: 'pred-init-4',
    text: 'Professors are very encouraging and provide prompt responses to student emails.',
    sentiment: 'positive',
    confidence: 0.86,
    source: 'demo',
    timestamp: 'Yesterday, 02:15 PM',
    wordCount: 11,
  },
  {
    id: 'pred-init-5',
    text: 'Assignment instructions were confusing and rubric was posted late.',
    sentiment: 'negative',
    confidence: 0.84,
    source: 'demo',
    timestamp: 'Yesterday, 11:30 AM',
    wordCount: 9,
  },
];

export const SUGGESTED_EXAMPLES = [
  'The faculty explains concepts clearly and the lab facilities are excellent.',
  'The classroom projector is broken and the timetable changes too often causing confusion.',
  'The course is okay overall, but assignment feedback could be faster and more detailed.',
  'I loved the collaborative group project; our teaching assistant was very supportive!',
  'The laboratory computers are slow, outdated, and disconnected during practical exams.',
];

export const ILLUSTRATIVE_METRICS = {
  accuracy: 0.842,
  macroF1: 0.826,
  precision: 0.835,
  recall: 0.821,
  classes: [
    { name: 'Positive', precision: 0.88, recall: 0.86, f1: 0.87, support: 420 },
    { name: 'Neutral', precision: 0.76, recall: 0.74, f1: 0.75, support: 230 },
    { name: 'Negative', precision: 0.85, recall: 0.88, f1: 0.86, support: 190 },
  ],
  confusionMatrix: [
    { actual: 'Positive', predPositive: 361, predNeutral: 38, predNegative: 21 },
    { actual: 'Neutral', predPositive: 34, predNeutral: 170, predNegative: 26 },
    { actual: 'Negative', predPositive: 15, predNeutral: 8, predNegative: 167 },
  ],
};
