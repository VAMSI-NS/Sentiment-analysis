from pathlib import Path
import re
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import PredictRequest, PredictResponse

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "sentiment_pipeline.joblib"
app = FastAPI(title="FeedbackAI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])
try:
    model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None
except Exception:
    model = None

POS = {"excellent","great","good","helpful","clear","love","amazing","comfortable","easy","supportive","best","enjoy","wonderful","organized","quiet","friendly"}
NEG = {"bad","poor","broken","late","slow","difficult","issue","problem","disappointing","unclear","noisy","disconnect","worst","lack","unavailable","crowded"}
def demo_predict(text: str):
    words = set(re.findall(r"[a-z']+", text.lower()))
    p, n = len(words & POS), len(words & NEG)
    if p > n: return "positive", min(.90, .62 + .05*(p-n))
    if n > p: return "negative", min(.90, .62 + .05*(n-p))
    return "neutral", .60

@app.get("/")
def root():
    return {"name":"FeedbackAI API","docs":"/docs","health":"/health"}
@app.get("/health")
def health():
    return {"status":"ok","model_loaded":model is not None,"mode":"trained_model" if model is not None else "demo_fallback"}
@app.post("/api/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    text = payload.text.strip()
    if model is not None:
        sentiment = str(model.predict([text])[0]).lower()
        confidence = float(max(model.predict_proba([text])[0])) if hasattr(model, "predict_proba") else .7
        if sentiment not in {"positive","neutral","negative"}: sentiment = "neutral"
        return PredictResponse(text=text, sentiment=sentiment, confidence=confidence, source="model")
    sentiment, confidence = demo_predict(text)
    return PredictResponse(text=text, sentiment=sentiment, confidence=confidence, source="demo")
