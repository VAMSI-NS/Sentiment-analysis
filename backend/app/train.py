"""Train a TF-IDF + Logistic Regression classifier from data/feedback.csv."""
from pathlib import Path
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "feedback.csv"
OUT = ROOT / "models" / "sentiment_pipeline.joblib"
LABELS = {"positive", "neutral", "negative"}

def main():
    if not DATA.exists():
        raise SystemExit("Create data/feedback.csv with columns text,label before training.")
    df = pd.read_csv(DATA).dropna(subset=["text", "label"])
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.lower().str.strip()
    df = df[(df.text != "") & df.label.isin(LABELS)]
    if len(df) < 30 or df.label.nunique() < 2:
        raise SystemExit("Use at least 30 labeled examples and at least two sentiment classes.")
    stratify = df.label if df.label.value_counts().min() >= 2 else None
    Xtr, Xte, ytr, yte = train_test_split(df.text, df.label, test_size=.2, random_state=42, stratify=stratify)
    pipe = Pipeline([("tfidf", TfidfVectorizer(ngram_range=(1,2), max_features=20000, strip_accents="unicode")), ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced"))])
    pipe.fit(Xtr, ytr)
    pred = pipe.predict(Xte)
    print(f"Examples: {len(df)} | Train: {len(Xtr)} | Test: {len(Xte)}")
    print(f"Held-out accuracy: {accuracy_score(yte, pred):.4f}")
    print(classification_report(yte, pred, zero_division=0))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, OUT)
    print(f"Saved model: {OUT}")
    print("Report only these measured metrics; do not substitute illustrative dashboard values.")
if __name__ == "__main__":
    main()
