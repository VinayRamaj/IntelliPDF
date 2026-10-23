from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class BaseDocRequest(BaseModel):
    doc_id: Optional[str] = Field(None, description="Document ID stored on server")
    text: Optional[str] = Field(None, description="Raw text of document (fallback)")

class SummaryRequest(BaseDocRequest):
    pass

class NotesRequest(BaseDocRequest):
    pass

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")

class ChatRequest(BaseDocRequest):
    question: str = Field(..., description="The user's question about the document")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation messages")

class QuizRequest(BaseDocRequest):
    count: Optional[int] = Field(5, description="Number of questions to generate (1-10)")

class FlashcardsRequest(BaseDocRequest):
    count: Optional[int] = Field(8, description="Number of flashcards to generate (1-15)")

class TranslateRequest(BaseDocRequest):
    language: str = Field(..., description="Target language to translate into")

class InsightsRequest(BaseDocRequest):
    pass
