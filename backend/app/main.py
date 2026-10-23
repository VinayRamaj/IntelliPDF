import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config.settings import UPLOAD_DIR, GEMINI_API_KEY, DEFAULT_MODEL
from app.api.upload import router as upload_router
from app.api.ai import router as ai_router
from app.services.document_store import list_documents

app = FastAPI(
    title="IntelliPDF API",
    description="Intelligent AI-powered Document Assistant API built with FastAPI and Google Gemini",
    version="2.0.0"
)

# Serve uploaded PDFs statically
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all local and network dev origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(ai_router)

@app.get("/")
def home():
    return {
        "name": "IntelliPDF API",
        "version": "2.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    """System health check and configuration status."""
    return {
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY),
        "model_configured": DEFAULT_MODEL,
        "uploads_count": len(list_documents())
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal Server Error: {str(exc)}",
            "type": exc.__class__.__name__
        }
    )