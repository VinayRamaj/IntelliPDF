from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

from app.services.pdf_service import extract_text_from_pdf

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf_data = extract_text_from_pdf(str(file_path))

    return {
    "message": "PDF uploaded successfully",
    "filename": file.filename,
    "url": f"http://127.0.0.1:8000/uploads/{file.filename}",
    "pages": pdf_data["pages"],
    "characters": pdf_data["characters"],
    "preview": pdf_data["text"][:500],
    "text": pdf_data["text"]
    }