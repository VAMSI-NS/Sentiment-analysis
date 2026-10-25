from typing import Literal
from pydantic import BaseModel, Field
Sentiment = Literal["positive", "neutral", "negative"]
class PredictRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
class PredictResponse(BaseModel):
    text: str
    sentiment: Sentiment
    confidence: float = Field(ge=0.0, le=1.0)
    source: Literal["model", "demo"]
