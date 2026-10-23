import sys
import io

# Ensure UTF-8 output on Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import fitz
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_sample_pdf() -> bytes:
    """Create a minimal PDF in memory for testing."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (50, 72),
        "Artificial Intelligence in Healthcare\n\n"
        "Artificial Intelligence (AI) and Machine Learning (ML) are transforming modern healthcare.\n"
        "Key applications include medical imaging analysis, disease risk prediction, and personalized medicine.\n"
        "Neural networks can detect anomalies in X-rays and MRI scans with high diagnostic accuracy.\n"
        "However, challenges such as algorithmic bias, patient data privacy, and clinical validation remain critical.\n"
        "Future research focuses on explainable AI (XAI) to ensure healthcare practitioners can trust automated diagnoses."
    )
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def test_health():
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    assert data["status"] == "healthy"
    print("[PASS] Health check passed:", data)

def test_upload_and_services():
    pdf_bytes = create_sample_pdf()
    files = {"file": ("healthcare_ai.pdf", pdf_bytes, "application/pdf")}
    res = client.post("/upload/", files=files)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    doc_data = res.json()
    assert "doc_id" in doc_data
    assert doc_data["pages"] == 1
    assert "Artificial Intelligence" in doc_data["text"]
    print("[PASS] PDF upload and text extraction passed. Doc ID:", doc_data["doc_id"])

    # Test documents listing
    list_res = client.get("/upload/documents")
    assert list_res.status_code == 200
    docs = list_res.json()
    assert any(d["doc_id"] == doc_data["doc_id"] for d in docs)
    print(f"[PASS] Document library list passed. Total stored docs: {len(docs)}")

    # Test Document retrieval
    get_res = client.get(f"/upload/documents/{doc_data['doc_id']}")
    assert get_res.status_code == 200
    print("[PASS] Document retrieval by ID passed.")

    # Test AI Chat with doc_id
    chat_res = client.post(
        "/ai/chat",
        json={
            "doc_id": doc_data["doc_id"],
            "question": "What are the main applications of AI mentioned in the document?",
            "history": []
        }
    )
    assert chat_res.status_code == 200, f"AI chat failed: {chat_res.text}"
    answer = chat_res.json().get("answer", "")
    assert len(answer) > 20
    print("[PASS] AI Chat passed. Sample response snippet:", answer[:120].strip().replace('\n', ' '), "...")

    # Test AI Summary with doc_id
    summary_res = client.post("/ai/summary", json={"doc_id": doc_data["doc_id"]})
    assert summary_res.status_code == 200
    summary = summary_res.json().get("summary", "")
    assert len(summary) > 20
    print("[PASS] AI Summary passed. Sample response snippet:", summary[:120].strip().replace('\n', ' '), "...")

    # Test AI Quiz with doc_id
    quiz_res = client.post("/ai/quiz", json={"doc_id": doc_data["doc_id"], "count": 2})
    assert quiz_res.status_code == 200
    quiz = quiz_res.json().get("quiz", [])
    assert len(quiz) >= 1
    assert "question" in quiz[0] and "options" in quiz[0]
    print(f"[PASS] AI Quiz passed. Generated {len(quiz)} questions.")

    # Test AI Flashcards with doc_id
    cards_res = client.post("/ai/flashcards", json={"doc_id": doc_data["doc_id"], "count": 3})
    assert cards_res.status_code == 200
    cards = cards_res.json().get("flashcards", [])
    assert len(cards) >= 1
    assert "front" in cards[0] and "back" in cards[0]
    print(f"[PASS] AI Flashcards passed. Generated {len(cards)} cards.")

    # Test AI Translation with doc_id
    trans_res = client.post("/ai/translate", json={"doc_id": doc_data["doc_id"], "language": "Hindi"})
    assert trans_res.status_code == 200
    trans = trans_res.json().get("translation", "")
    assert len(trans) > 10
    print("[PASS] AI Translation passed. Sample translation snippet:", trans[:80].strip().replace('\n', ' '), "...")

if __name__ == "__main__":
    print("Running IntelliPDF Comprehensive Backend Test Suite...")
    test_health()
    test_upload_and_services()
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")
