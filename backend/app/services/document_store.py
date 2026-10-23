import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.config.settings import UPLOAD_DIR

logger = logging.getLogger("document_store")
METADATA_FILE = UPLOAD_DIR / "documents.json"

# In-memory document cache: doc_id -> metadata dict
_DOC_CACHE: Dict[str, Dict[str, Any]] = {}

def _load_metadata():
    global _DOC_CACHE
    if METADATA_FILE.exists():
        try:
            with open(METADATA_FILE, "r", encoding="utf-8") as f:
                _DOC_CACHE = json.load(f)
        except Exception as e:
            logger.warning(f"Could not load metadata file: {e}")
            _DOC_CACHE = {}

def _save_metadata():
    try:
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(_DOC_CACHE, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Failed to persist metadata file: {e}")

# Initial load
_load_metadata()

def save_document(doc_id: str, data: Dict[str, Any]) -> None:
    """Save document metadata to cache and disk."""
    _DOC_CACHE[doc_id] = data
    _save_metadata()

def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve document metadata by doc_id."""
    return _DOC_CACHE.get(doc_id)

def list_documents() -> List[Dict[str, Any]]:
    """Return all stored documents sorted by upload time (newest first)."""
    docs = list(_DOC_CACHE.values())
    docs.sort(key=lambda d: d.get("uploaded_at", 0), reverse=True)
    return docs

def delete_document(doc_id: str) -> bool:
    """Delete document metadata and local file."""
    doc = _DOC_CACHE.pop(doc_id, None)
    if not doc:
        return False
    _save_metadata()
    file_path = doc.get("file_path")
    if file_path:
        p = Path(file_path)
        if p.exists() and p.is_file():
            try:
                p.unlink()
            except Exception as e:
                logger.error(f"Failed to delete file {file_path}: {e}")
    return True
