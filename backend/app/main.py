import hashlib
import logging
import os
import re
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated, Literal

import joblib
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import Base, Feedback, LoginSession, SessionLocal, User, engine
from app.schemas import (
    AdminSummary,
    FeedbackResponse,
    LoginRequest,
    PredictRequest,
    PredictResponse,
    RegisterRequest,
    Sentiment,
    SentimentCounts,
    StudentsPageResponse,
    TrendDay,
    UserResponse,
)

logger = logging.getLogger(__name__)
ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "sentiment_pipeline.joblib"
SESSION_COOKIE = "feedbackai_session"
SESSION_DAYS = 7
password_hasher = PasswordHasher()

try:
    model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None
except Exception:
    logger.exception("Could not load sentiment model at %s; using the documented demo fallback.", MODEL_PATH)
    model = None

POS = {
    "excellent", "great", "good", "helpful", "clear", "love", "amazing",
    "comfortable", "easy", "supportive", "best", "enjoy", "wonderful",
    "organized", "quiet", "friendly",
}
NEG = {
    "bad", "poor", "broken", "late", "slow", "difficult", "issue", "problem",
    "disappointing", "unclear", "noisy", "disconnect", "worst", "lack",
    "unavailable", "crowded",
}


def allowed_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGINS", "")
    origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://sentiment-analysis-frontend-y6rc.onrender.com",
    }
    origins.update(origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip())
    return sorted(origins)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        db.execute(delete_expired_sessions_statement())
        db.commit()
        configured_email = os.getenv("DEAN_EMAIL", "").strip().lower()
        initial_password = os.getenv("DEAN_INITIAL_PASSWORD")
        dean = db.scalar(select(User).where(User.email == configured_email)) if configured_email else None
        if configured_email and dean is None and initial_password:
            dean = User(
                email=configured_email,
                password_hash=password_hasher.hash(initial_password),
                role="dean",
            )
            db.add(dean)
            db.commit()
            logger.info("Bootstrapped the configured Dean account.")
        elif not configured_email or (dean is None and not initial_password):
            logger.warning("DEAN_EMAIL and DEAN_INITIAL_PASSWORD must both be configured to bootstrap the Dean account.")
        elif dean.role != "dean":
            raise RuntimeError("DEAN_EMAIL is already registered as a non-Dean account.")
    yield


def delete_expired_sessions_statement():
    from sqlalchemy import delete

    return delete(LoginSession).where(LoginSession.expires_at < datetime.now(timezone.utc))


app = FastAPI(title="FeedbackAI API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)


def get_db():
    with SessionLocal() as db:
        yield db


Database = Annotated[Session, Depends(get_db)]


def require_same_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") not in allowed_origins():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Request origin is not allowed.")


def get_current_user(
    request: Request,
    db: Database,
) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please sign in.")

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    session_record = db.scalar(
        select(LoginSession).where(
            LoginSession.token_hash == token_hash,
            LoginSession.expires_at > datetime.now(timezone.utc),
        )
    )
    user = db.get(User, session_record.user_id) if session_record else None
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your session has expired.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_dean(user: CurrentUser) -> User:
    if user.role != "dean":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Dean access is required.")
    return user


DeanUser = Annotated[User, Depends(require_dean)]


def set_session_cookie(response: Response, db: Session, user: User) -> None:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    db.add(
        LoginSession(
            token_hash=hashlib.sha256(token.encode("utf-8")).hexdigest(),
            user_id=user.id,
            expires_at=expires_at,
        )
    )
    db.commit()
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        expires=expires_at,
        httponly=True,
        secure=os.getenv("SESSION_COOKIE_SECURE", "true" if os.getenv("RENDER") else "false").lower() == "true",
        samesite="lax",
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        SESSION_COOKIE,
        httponly=True,
        secure=os.getenv("SESSION_COOKIE_SECURE", "true" if os.getenv("RENDER") else "false").lower() == "true",
        samesite="lax",
        path="/",
    )


def predict_text(text_value: str) -> tuple[Sentiment, float, Literal["model", "demo"]]:
    if model is not None:
        sentiment = str(model.predict([text_value])[0]).lower()
        confidence = float(max(model.predict_proba([text_value])[0])) if hasattr(model, "predict_proba") else 0.7
        if sentiment not in {"positive", "neutral", "negative"}:
            sentiment = "neutral"
        return sentiment, confidence, "model"

    sentiment, confidence = demo_predict(text_value)
    return sentiment, confidence, "demo"


def demo_predict(text_value: str) -> tuple[Sentiment, float]:
    words = set(re.findall(r"[a-z']+", text_value.lower()))
    positive, negative = len(words & POS), len(words & NEG)
    if positive > negative:
        return "positive", min(0.90, 0.62 + 0.05 * (positive - negative))
    if negative > positive:
        return "negative", min(0.90, 0.62 + 0.05 * (negative - positive))
    return "neutral", 0.60


def feedback_response(feedback: Feedback, student_email: str | None = None) -> dict:
    return {
        "id": feedback.id,
        "text": feedback.text,
        "sentiment": feedback.sentiment,
        "confidence": feedback.confidence,
        "source": feedback.source,
        "timestamp": feedback.created_at,
        "student_id": feedback.student_id,
        "student_email": student_email or "",
    }


@app.get("/")
def root():
    return {"name": "FeedbackAI API", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        database_status = "connected"
    except Exception:
        logger.exception("Database health check failed.")
        database_status = "unavailable"
    return {
        "status": "ok" if database_status == "connected" else "degraded",
        "database": database_status,
        "model_loaded": model is not None,
        "mode": "trained_model" if model is not None else "demo_fallback",
    }


@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, response: Response, db: Database):
    require_same_origin(request)
    protected_email = os.getenv("DEAN_EMAIL", "").strip().lower()
    if protected_email and payload.email == protected_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This email cannot be registered as a student.")

    user = User(email=payload.email, password_hash=password_hasher.hash(payload.password), role="student")
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    set_session_cookie(response, db, user)
    return user


@app.post("/api/auth/login", response_model=UserResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Database):
    require_same_origin(request)
    user = db.scalar(select(User).where(User.email == payload.email))
    try:
        if user is None:
            password_hasher.hash(secrets.token_urlsafe(24))
            raise VerifyMismatchError
        password_hasher.verify(user.password_hash, payload.password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or password is incorrect.")

    if user.role != payload.role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account does not use the selected role.")

    set_session_cookie(response, db, user)
    return user


@app.get("/api/auth/me", response_model=UserResponse)
def current_user_profile(user: CurrentUser):
    return user


@app.post("/api/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, response: Response, db: Database):
    require_same_origin(request)
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        session_record = db.scalar(select(LoginSession).where(LoginSession.token_hash == token_hash))
        if session_record:
            db.delete(session_record)
            db.commit()
    clear_session_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@app.get("/api/feedback/mine", response_model=list[PredictResponse])
def my_feedback(user: CurrentUser, db: Database):
    records = db.scalars(
        select(Feedback).where(Feedback.student_id == user.id).order_by(Feedback.created_at.desc()).limit(200)
    ).all()
    return [
        {
            "id": item.id,
            "text": item.text,
            "sentiment": item.sentiment,
            "confidence": item.confidence,
            "source": item.source,
            "timestamp": item.created_at,
        }
        for item in records
    ]


@app.post("/api/predict", response_model=PredictResponse)
def predict(payload: PredictRequest, request: Request, user: CurrentUser, db: Database):
    require_same_origin(request)
    sentiment, confidence, source = predict_text(payload.text)
    feedback = Feedback(
        student_id=user.id,
        text=payload.text,
        sentiment=sentiment,
        confidence=confidence,
        source=source,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return {
        "id": feedback.id,
        "text": feedback.text,
        "sentiment": feedback.sentiment,
        "confidence": feedback.confidence,
        "source": feedback.source,
        "timestamp": feedback.created_at,
    }


@app.get("/api/admin/summary", response_model=AdminSummary)
def admin_summary(_: DeanUser, db: Database):
    total_feedback = db.scalar(select(func.count(Feedback.id))) or 0
    total_students = db.scalar(select(func.count(User.id)).where(User.role == "student")) or 0
    counts = {
        row[0]: row[1]
        for row in db.execute(select(Feedback.sentiment, func.count(Feedback.id)).group_by(Feedback.sentiment))
    }
    sentiment_counts = SentimentCounts(
        positive=counts.get("positive", 0),
        neutral=counts.get("neutral", 0),
        negative=counts.get("negative", 0),
    )

    today = datetime.now(timezone.utc).date()
    first_day = today - timedelta(days=6)
    grouped = db.execute(
        select(func.date(Feedback.created_at), Feedback.sentiment, func.count(Feedback.id))
        .where(Feedback.created_at >= datetime.combine(first_day, datetime.min.time(), timezone.utc))
        .group_by(func.date(Feedback.created_at), Feedback.sentiment)
    )
    values = {(str(day), sentiment): count for day, sentiment, count in grouped}
    trend = [
        TrendDay(
            day=(first_day + timedelta(days=offset)).strftime("%a"),
            positive=values.get((str(first_day + timedelta(days=offset)), "positive"), 0),
            neutral=values.get((str(first_day + timedelta(days=offset)), "neutral"), 0),
            negative=values.get((str(first_day + timedelta(days=offset)), "negative"), 0),
        )
        for offset in range(7)
    ]
    return AdminSummary(
        total_feedback=total_feedback,
        total_students=total_students,
        sentiment_counts=sentiment_counts,
        trend=trend,
    )


@app.get("/api/admin/feedback")
def all_feedback(
    _: DeanUser,
    db: Database,
    sentiment: Sentiment | None = None,
    search: str = Query(default="", max_length=200),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    filters = []
    if sentiment:
        filters.append(Feedback.sentiment == sentiment)
    if search.strip():
        pattern = f"%{search.strip()}%"
        filters.append((Feedback.text.ilike(pattern)) | (User.email.ilike(pattern)))

    query = select(Feedback, User.email).join(User, Feedback.student_id == User.id).where(*filters)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    records = db.execute(
        query.order_by(Feedback.created_at.desc()).limit(limit).offset(offset)
    ).all()
    return {
        "total": total,
        "items": [feedback_response(item, email) for item, email in records],
    }


@app.get("/api/admin/students", response_model=StudentsPageResponse)
def all_students(
    _: DeanUser,
    db: Database,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    total = db.scalar(select(func.count(User.id)).where(User.role == "student")) or 0
    records = db.execute(
        select(User, func.count(Feedback.id))
        .outerjoin(Feedback, Feedback.student_id == User.id)
        .where(User.role == "student")
        .group_by(User.id)
        .order_by(User.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return {
        "total": total,
        "items": [
            {
                "id": student.id,
                "email": student.email,
                "created_at": student.created_at,
                "feedback_count": count,
            }
            for student, count in records
        ],
    }
