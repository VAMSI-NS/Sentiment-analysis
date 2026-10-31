import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


Sentiment = Literal["positive", "neutral", "negative"]
Role = Literal["student", "dean"]


class RegisterRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=10, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=128)
    role: Role

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class UserResponse(BaseModel):
    id: int
    email: str
    role: Role
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PredictRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)

    @field_validator("text")
    @classmethod
    def non_blank_text(cls, value: str) -> str:
        text = value.strip()
        if not text:
            raise ValueError("Feedback text cannot be blank.")
        return text


class PredictResponse(BaseModel):
    id: int
    text: str
    sentiment: Sentiment
    confidence: float = Field(ge=0.0, le=1.0)
    source: Literal["model", "demo"]
    timestamp: datetime


class FeedbackResponse(PredictResponse):
    student_id: int
    student_email: str


class StudentResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    feedback_count: int


class StudentsPageResponse(BaseModel):
    total: int
    items: list[StudentResponse]


class SentimentCounts(BaseModel):
    positive: int
    neutral: int
    negative: int


class TrendDay(BaseModel):
    day: str
    positive: int
    neutral: int
    negative: int


class AdminSummary(BaseModel):
    total_feedback: int
    total_students: int
    sentiment_counts: SentimentCounts
    trend: list[TrendDay]
