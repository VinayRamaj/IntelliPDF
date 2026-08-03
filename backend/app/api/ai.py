from fastapi import APIRouter
from pydantic import BaseModel

from app.services.gemini_service import (
    summarize_pdf,
    ask_pdf,
    generate_notes
)

router = APIRouter(prefix="/ai", tags=["AI"])


class SummaryRequest(BaseModel):
    text: str


class ChatRequest(BaseModel):
    text: str
    question: str


@router.post("/summary")
def summary(data: SummaryRequest):
    return {
        "summary": summarize_pdf(data.text)
    }


@router.post("/chat")
def chat(data: ChatRequest):
    return {
        "answer": ask_pdf(data.text, data.question)
    }


@router.post("/notes")
def notes(data: SummaryRequest):
    return {
        "notes": generate_notes(data.text)
    }