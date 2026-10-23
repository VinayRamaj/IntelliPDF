import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any

from app.services.pdf_service import process_uploaded_pdf
from app.services.document_store import save_document, list_documents, get_document, delete_document

router = APIRouter(prefix="/upload", tags=["Upload"])
logger = logging.getLogger("upload_router")

@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process a PDF document."""
    if not file.filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF documents are supported (.pdf format)."
        )

    try:
        file_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(status_code=400, detail="Failed to read file from request.")

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Process and extract text using PyMuPDF
    doc_data = process_uploaded_pdf(file_bytes, file.filename)

    # Save metadata in store
    save_document(doc_data["doc_id"], doc_data)

    return {
        "message": "PDF uploaded successfully",
        "doc_id": doc_data["doc_id"],
        "filename": doc_data["filename"],
        "url": doc_data["url"],
        "pages": doc_data["pages"],
        "characters": doc_data["characters"],
        "words": doc_data["words"],
        "is_scanned": doc_data["is_scanned"],
        "preview": doc_data["preview"],
        "text": doc_data["text"]
    }

@router.get("/documents")
def get_recent_documents() -> List[Dict[str, Any]]:
    """List all recently processed documents (lightweight metadata)."""
    docs = list_documents()
    # Strip full text to keep payload light
    return [
        {
            "doc_id": d["doc_id"],
            "filename": d["filename"],
            "url": d.get("url", ""),
            "pages": d.get("pages", 0),
            "characters": d.get("characters", 0),
            "words": d.get("words", 0),
            "is_scanned": d.get("is_scanned", False),
            "uploaded_at": d.get("uploaded_at", 0)
        }
        for d in docs
    ]

@router.get("/documents/{doc_id}")
def get_document_by_id(doc_id: str) -> Dict[str, Any]:
    """Retrieve complete document metadata and text by doc_id."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.delete("/documents/{doc_id}")
def remove_document(doc_id: str) -> Dict[str, str]:
    """Delete a document and its stored file."""
    success = delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or already deleted.")
    return {"message": "Document deleted successfully."}