# Project workflow

## Architecture
Student text or CSV → React + TypeScript dashboard → FastAPI `/api/predict` → trained TF-IDF + Logistic Regression model if present; otherwise a clearly labeled demo heuristic.

## Modules
- Overview: illustrative KPI cards, charts and sample feedback.
- Analyze Feedback: single-comment prediction.
- Batch Analysis: CSV preview/export using demo heuristics in the browser.
- Model Evaluation: model status and validation checklist.
- Saved Analyses: in-memory browser session history.
- Settings: API URL and backend/model status.

## Training and evaluation
Create `backend/data/feedback.csv` with columns `text,label` and labels `positive`, `neutral`, `negative`. Install requirements and run `python -m app.train` from `backend/`. It prints held-out accuracy and per-class precision/recall/F1, then saves the model artifact. The included sample CSV is deliberately tiny and must not be used to claim reliable performance.

## Limitations
- Demo fallback is keyword matching, not machine learning.
- Dashboard KPI/chart values are illustrative placeholders.
- CSV batch classifications are client-side demo heuristics and do not call the API row by row.
- History is memory-only and disappears after refresh.
- No authentication, persistent database, or production deployment configuration is included.
