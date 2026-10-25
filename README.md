# FeedbackAI — Student Feedback Sentiment Analysis

FeedbackAI is a modern, responsive React + TypeScript dashboard and FastAPI machine learning system designed to analyze and categorize student feedback comments into **Positive**, **Neutral**, and **Negative** sentiments.

Built with:
- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Scikit-learn (TF-IDF + Multinomial Logistic Regression / LinearSVC)

---

## 🌟 Key Features

1. **Executive SaaS Dashboard (Overview)**
   - High-level KPI summary cards (Total volume, Positive ratio %, Needs attention ratio %, Model status).
   - Interactive weekly trend Area Chart with category distributions.
   - Sentiment Split Donut Chart with central counter.
   - Recent feedback list with confidence scores and source badges.

2. **Single Student Feedback Sentiment Analysis**
   - Real-time classification of individual student remarks.
   - Confidence estimate progress meter and sentiment badges.
   - Lexical keyword match transparency (highlighting positive/negative terms).
   - Live JSON export and session history logging.

3. **Batch Analysis & CSV Export**
   - Drag-and-drop or file selector for CSV files with feedback comments.
   - **One-click Built-in Sample Dataset (18 rows)** for instant testing without an external file.
   - Filterable table by sentiment tabs (All, Positive, Neutral, Negative) and real-time search.
   - One-click **Export Processed CSV** with sentiment classifications and confidence scores.

4. **Model Evaluation & Capstone Compliance**
   - Live backend health status check and model artifact indicator.
   - Comprehensive metrics guide: Accuracy, Precision, Recall, and Macro F1-score with formulas.
   - Illustrative held-out test split metrics and Confusion Matrix.
   - 5-step interactive academic validation checklist.
   - Clear disclosure distinguishing demo heuristics from trained model inference.

5. **Saved Analyses & History**
   - In-memory session history tracking all analyzed remarks.
   - Search filter, sentiment category filters, and JSON export.

6. **Settings & FastAPI Integration**
   - Configurable API Base URL (defaults to `http://127.0.0.1:8000`).
   - Built-in latency connection tester (`/health` ping in ms).
   - Graceful client-side fallback heuristic when backend is offline.

---

## 🚀 Getting Started

### 1. Frontend Setup (React + Vite)
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the Vite dev URL) in your browser.

### 2. Backend Setup (FastAPI + Python)
Requirements: Python 3.10+
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# On Linux / macOS:
source .venv/bin/activate
# On Windows PowerShell:
# .\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Model Training
To train the model on your labeled dataset:
1. Place your labeled CSV at `backend/data/feedback.csv` with columns `text,label` (labels: `positive`, `neutral`, `negative`).
2. Run the training script:
```bash
cd backend
python -m app.train
```
This trains a TF-IDF vectorizer + Logistic Regression pipeline, prints precision/recall/F1 metrics, and saves the artifact to `backend/models/sentiment_pipeline.joblib`.

---

## 🧪 Testing
The frontend includes decoupled unit tests for pure sentiment analysis logic and CSV processing:
```bash
npx --yes tsx --test src/utils/sentiment.test.ts
```

---

## 📝 License
Apache-2.0
