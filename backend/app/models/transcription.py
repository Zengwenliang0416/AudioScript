from typing import List, Optional
from pydantic import BaseModel, Field

class TranscriptionOptions(BaseModel):
    auto_punctuation: bool = True
    punctuation_style: str = "auto"
    detect_language: bool = True
    multi_language: bool = False
    tone_analysis: bool = True
    language: str = "auto"

class ToneInfo(BaseModel):
    type: str
    confidence: float

class Segment(BaseModel):
    start: float
    end: float
    text: str
    language: Optional[str] = None
    tone: Optional[ToneInfo] = None

class TranscriptionStatus(BaseModel):
    id: str
    status: str
    progress: Optional[float] = 0
    error: Optional[str] = None
    segments: Optional[List[Segment]] = None 