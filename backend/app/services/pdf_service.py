import re
import uuid
import time
import logging
from pathlib import Path
from typing import Dict, Any, List
import fitz  # PyMuPDF
from fastapi import HTTPException

from app.config.settings import UPLOAD_DIR, MAX_FILE_SIZE_BYTES

logger = logging.getLogger("pdf_service")

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and illegal characters."""
    # Remove path elements
    name = Path(filename).name
    # Keep only alphanumeric, dash, underscore, dot
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)
    # Ensure it ends with .pdf
    if not clean_name.lower().endswith('.pdf'):
        clean_name += '.pdf'
    return clean_name

def process_uploaded_pdf(file_bytes: bytes, original_filename: str) -> Dict[str, Any]:
    """Validate, store, and extract text and metadata from an uploaded PDF file."""
    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # Validate PDF signature (magic bytes)
    if not file_bytes.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. The file is not a valid PDF document."
        )

    # Generate unique document ID and safe filename
    doc_id = str(uuid.uuid4())
    safe_name = sanitize_filename(original_filename)
    stored_filename = f"{doc_id}_{safe_name}"
    file_path = UPLOAD_DIR / stored_filename

    # Save file to disk
    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        logger.error(f"Failed to write file to disk: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")

    # Parse PDF using PyMuPDF
    try:
        document = fitz.open(str(file_path))
    except Exception as e:
        logger.error(f"PyMuPDF failed to open file {file_path}: {e}")
        # Clean up corrupted file
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=400,
            detail="Unable to open PDF. The file may be damaged or corrupted."
        )

    try:
        if document.is_encrypted:
            document.close()
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=400,
                detail="Password-protected PDFs are not supported. Please unlock the file first."
            )

        page_count = len(document)
        pages_content: List[Dict[str, Any]] = []
        full_text_parts: List[str] = []

        for page_num in range(page_count):
            page = document[page_num]
            page_text = page.get_text() or ""
            # Clean repetitive whitespaces
            cleaned_page_text = re.sub(r'[ \t]+', ' ', page_text).strip()
            pages_content.append({
                "page": page_num + 1,
                "text": cleaned_page_text,
                "char_count": len(cleaned_page_text),
                "word_count": len(cleaned_page_text.split()) if cleaned_page_text else 0
            })
            if cleaned_page_text:
                full_text_parts.append(f"--- [Page {page_num + 1}] ---\n{cleaned_page_text}")

        document.close()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while reading the PDF content: {str(e)}"
        )

    full_text = "\n\n".join(full_text_parts).strip()
    total_characters = sum(p["char_count"] for p in pages_content)
    total_words = sum(p["word_count"] for p in pages_content)
    is_scanned = total_characters < 30 and page_count > 0

    return {
        "doc_id": doc_id,
        "filename": original_filename,
        "stored_filename": stored_filename,
        "file_path": str(file_path),
        "url": f"/uploads/{stored_filename}",
        "pages": page_count,
        "characters": total_characters,
        "words": total_words,
        "is_scanned": is_scanned,
        "preview": full_text[:600] if full_text else "",
        "text": full_text,
        "pages_detail": pages_content,
        "uploaded_at": int(time.time())
    }