from typing import Optional, List
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class AnalyzeResponse(BaseModel):
    language: str
    category: str
    score: int
    intent: str
    reason: str


class GenerateReplyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: str = 'en'
    category: str = 'other'


class GenerateReplyResponse(BaseModel):
    reply: str


class PostInsight(BaseModel):
    text: str
    language: Optional[str] = 'en'
    category: Optional[str] = 'other'
    score: Optional[int] = 0
    intent: Optional[str] = 'unknown'
    reason: Optional[str] = ''
