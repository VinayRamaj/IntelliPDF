from fastapi import APIRouter, HTTPException
from typing import Optional

from app.models.schemas import (
    SummaryRequest,
    NotesRequest,
    ChatRequest,
    QuizRequest,
    FlashcardsRequest,
    TranslateRequest,
    InsightsRequest
)
from app.services.document_store import get_document
from app.services.gemini_service import (
    summarize_pdf,
    ask_pdf,
    generate_notes,
    generate_quiz,
    generate_flashcards,
    translate_pdf,
    extract_insights
)

router = APIRouter(prefix="/ai", tags=["AI"])

def _resolve_text(doc_id: Optional[str], direct_text: Optional[str]) -> str:
    """Helper to resolve document text from doc_id or direct text."""
    if doc_id:
        doc = get_document(doc_id)
        if doc and doc.get("text"):
            return doc["text"]
        elif not direct_text:
            raise HTTPException(
                status_code=404,
                detail=f"Document with ID '{doc_id}' not found. Please upload the PDF again."
            )

    if direct_text and direct_text.strip():
        return direct_text.strip()

    raise HTTPException(
        status_code=400,
        detail="Missing document content. Please provide either 'doc_id' or 'text'."
    )

@router.post("/summary")
def summary(data: SummaryRequest):
    text = _resolve_text(data.doc_id, data.text)
    return {
        "summary": summarize_pdf(text)
    }

@router.post("/notes")
def notes(data: NotesRequest):
    text = _resolve_text(data.doc_id, data.text)
    return {
        "notes": generate_notes(text)
    }

@router.post("/chat")
def chat(data: ChatRequest):
    text = _resolve_text(data.doc_id, data.text)
    history_dicts = [h.model_dump() for h in data.history] if data.history else []
    return {
        "answer": ask_pdf(text, data.question, history=history_dicts)
    }

@router.post("/quiz")
def quiz(data: QuizRequest):
    text = _resolve_text(data.doc_id, data.text)
    count = min(max(data.count or 5, 1), 10)
    return {
        "quiz": generate_quiz(text, count=count)
    }

@router.post("/flashcards")
def flashcards(data: FlashcardsRequest):
    text = _resolve_text(data.doc_id, data.text)
    count = min(max(data.count or 8, 1), 15)
    return {
        "flashcards": generate_flashcards(text, count=count)
    }

@router.post("/translate")
def translate(data: TranslateRequest):
    text = _resolve_text(data.doc_id, data.text)
    if not data.language:
        raise HTTPException(status_code=400, detail="Language must be specified.")
    return {
        "language": data.language,
        "translation": translate_pdf(text, data.language)
    }

@router.post("/insights")
def insights(data: InsightsRequest):
    text = _resolve_text(data.doc_id, data.text)
    return extract_insights(text)