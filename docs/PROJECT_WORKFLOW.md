# Project workflow

## Architecture
Student account → React + TypeScript student workspace → FastAPI authenticated `/api/predict` → existing trained TF-IDF + Logistic Regression model if present; otherwise a clearly labeled demo heuristic. Sentiment, confidence, source, timestamp, and owner are stored in the SQLAlchemy database.

Dean sessions use the same backend authentication and access database-backed overview, feedback, and student endpoints. The API stores only Argon2 password hashes and hashed, revocable session tokens.

## Modules
- Dean Overview: live database-backed KPI cards, sentiment distribution, weekly trend, and recent submissions.
- Dean Feedback Management and Registered Students: searchable, filterable, paginated database records.
- Student Dashboard: single-comment prediction, persisted submissions, and private feedback history.
- Analyze Feedback: single-comment prediction that is persisted for the authenticated account.
- Batch Analysis: CSV preview/export using demo heuristics in the browser.
- Model Evaluation: model status and validation checklist.
- Saved Analyses: in-memory Dean workspace history; student submission history is persisted.
- Settings: API URL and backend/model status.

## Training and evaluation
Create `backend/data/feedback.csv` with columns `text,label` and labels `positive`, `neutral`, `negative`. Install requirements and run `python -m app.train` from `backend/`. It prints held-out accuracy and per-class precision/recall/F1, then saves the model artifact. The included sample CSV is deliberately tiny and must not be used to claim reliable performance.

## Limitations
- Demo fallback is keyword matching, not machine learning.
- Dashboard KPI/chart values are illustrative placeholders.
- CSV batch classifications are client-side demo heuristics and do not call the API row by row.
- Local development uses SQLite when `DATABASE_URL` is unset. Render deployments must configure `DATABASE_URL` to a persistent PostgreSQL instance; Render's ephemeral filesystem is not used for production records.
- Student registration is self-service and always assigns the student role. Dean credentials and frontend/API URLs must be configured as service environment variables.
