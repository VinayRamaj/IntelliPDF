import json
import logging
import re
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from fastapi import HTTPException

from app.config.settings import GEMINI_API_KEY, DEFAULT_MODEL, FALLBACK_MODELS

logger = logging.getLogger("gemini_service")

# Configure Google Generative AI
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set. AI features will fail until configured.")
else:
    genai.configure(api_key=GEMINI_API_KEY, transport="rest")

def _get_model(model_name: Optional[str] = None) -> genai.GenerativeModel:
    """Instantiate model with fallback if primary is unavailable."""
    name = model_name or DEFAULT_MODEL
    # Strip 'models/' prefix if user provided it
    clean_name = name.replace("models/", "")
    return genai.GenerativeModel(f"models/{clean_name}")

def _generate_with_fallback(prompt: str, temperature: float = 0.4) -> str:
    """Execute Gemini prompt with fallback models and detailed error handling."""
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API Key is missing. Please add GEMINI_API_KEY to backend/.env."
        )

    last_error = None
    for model_candidate in FALLBACK_MODELS:
        try:
            model = _get_model(model_candidate)
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                )
            )

            # Safely check response candidates
            if not response.candidates:
                raise ValueError("No response candidates returned by Gemini.")

            candidate = response.candidates[0]
            # Check finish reason
            finish_reason = getattr(candidate, "finish_reason", None)
            # finish_reason 2 is SAFETY, 3 is RECITATION, etc.
            if str(finish_reason) in ["2", "SAFETY"]:
                raise HTTPException(
                    status_code=400,
                    detail="Content generation was flagged by safety filters."
                )

            # Return text safely
            if response.text:
                return response.text.strip()
            else:
                # In case response.text accessor fails
                text_parts = []
                for part in candidate.content.parts:
                    if hasattr(part, "text"):
                        text_parts.append(part.text)
                if text_parts:
                    return "".join(text_parts).strip()

        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Model {model_candidate} failed: {e}. Trying next fallback...")
            last_error = e
            continue

    logger.error(f"All Gemini models failed: {last_error}")
    raise HTTPException(
        status_code=500,
        detail=f"AI Service Error: {str(last_error)}"
    )

def _clean_json_response(raw_text: str) -> str:
    """Extract JSON block from markdown code fence if present."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
    if match:
        return match.group(1).strip()
    return raw_text.strip()

def _budget_text(text: str, max_chars: int = 120000) -> str:
    """Keep text within safe token/character limits."""
    if len(text) <= max_chars:
        return text
    half = max_chars // 2
    return text[:half] + "\n\n... [Content condensed for processing] ...\n\n" + text[-half:]


# ==========================================================
# AI Service Methods
# ==========================================================

def summarize_pdf(text: str) -> str:
    """Generate structured executive summary and key takeaways."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Cannot summarize an empty document.")

    safe_text = _budget_text(text)
    prompt = f"""
You are an expert academic and professional document analyst.
Provide a clear, well-structured, and comprehensive summary of the document below.

Format your response in GitHub-flavored Markdown:
# 📑 Executive Summary
A concise 2-3 paragraph overview capturing the core thesis, purpose, and conclusions.

## 🎯 Key Takeaways & Core Themes
- Bullet point highlighting the most critical insight
- Bullet point highlighting practical implications
- Bullet point highlighting core methodology or arguments

## 🔍 In-Depth Breakdown
Break down the main topics or chapters with subheadings and clear bullet points.

## 💡 Practical Conclusion & Next Steps
Brief final thought on what a student, researcher, or professional should take away from this.

Document Content:
\"\"\"
{safe_text}
\"\"\"
"""
    return _generate_with_fallback(prompt, temperature=0.3)


def generate_notes(text: str) -> str:
    """Generate comprehensive study/revision notes."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Cannot generate notes from an empty document.")

    safe_text = _budget_text(text)
    prompt = f"""
You are an award-winning university professor.
Transform the following document into elite, high-yield study notes optimized for learning and exam revision.

Rules:
- Organize with clear hierarchical Markdown headers (`#`, `##`, `###`).
- Use bullet points, bold key terms, and definitions.
- Include a "📌 High-Yield Exam Points" section.
- Include a "🧠 Quick Review Questions" section with 3-4 self-test questions.

Document:
\"\"\"
{safe_text}
\"\"\"
"""
    return _generate_with_fallback(prompt, temperature=0.3)


def ask_pdf(text: str, question: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """Multi-turn conversational QA grounded strictly in the document."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Document text is empty.")
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    safe_text = _budget_text(text, max_chars=100000)

    # Format previous conversation history if provided
    history_str = ""
    if history:
        recent_history = history[-6:]  # Keep last 3 turns
        formatted_turns = []
        for turn in recent_history:
            role = "User" if turn.get("role") == "user" else "Assistant"
            formatted_turns.append(f"{role}: {turn.get('content', '')}")
        history_str = "\n".join(formatted_turns)

    prompt = f"""
You are IntelliPDF AI, an intelligent, helpful document assistant.
Answer the user's question accurately using ONLY the information provided in the document below.

Guidelines:
- Ground your answer strictly in the document text.
- If the document references page numbers like "--- [Page X] ---", cite the relevant page(s).
- Be polite, direct, and clear. Format answers nicely with markdown lists or code blocks when helpful.
- If the answer cannot be found in the document, respond:
  "I couldn't find that information in the provided document. Please feel free to ask another question based on its contents."

Document:
\"\"\"
{safe_text}
\"\"\"

Conversation History:
{history_str if history_str else "No previous conversation."}

User Question:
{question}
"""
    return _generate_with_fallback(prompt, temperature=0.2)


def generate_quiz(text: str, count: int = 5) -> List[Dict[str, Any]]:
    """Generate interactive multiple choice quiz in structured JSON format."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Document text is empty.")

    safe_text = _budget_text(text, max_chars=80000)
    prompt = f"""
You are an expert exam creator.
Create {count} high-quality Multiple Choice Questions (MCQs) based strictly on the key concepts in the document below.

Return ONLY a valid JSON array of objects. Do not wrap in extra prose.
Each question object MUST follow this exact JSON schema:
[
  {{
    "id": 1,
    "question": "Clear, challenging question testing understanding",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correct_answer": 0,
    "explanation": "Clear explanation of why this answer is correct and why other options are incorrect.",
    "difficulty": "Easy"
  }}
]

Note: "correct_answer" must be the zero-based index (0, 1, 2, or 3) of the correct option in the "options" list.
"difficulty" can be "Easy", "Medium", or "Hard".

Document:
\"\"\"
{safe_text}
\"\"\"
"""
    raw_response = _generate_with_fallback(prompt, temperature=0.3)
    clean_json = _clean_json_response(raw_response)
    try:
        data = json.loads(clean_json)
        if isinstance(data, list) and len(data) > 0:
            return data
    except Exception as e:
        logger.error(f"Failed to parse quiz JSON: {e}. Raw: {raw_response[:300]}")

    # Fallback default questions if JSON parsing failed
    return [
        {
            "id": 1,
            "question": "What is the primary topic discussed in the uploaded document?",
            "options": ["Document overview & key findings", "Unrelated topics", "General commentary", "None of the above"],
            "correct_answer": 0,
            "explanation": "The document primarily focuses on its key topics and structured findings.",
            "difficulty": "Easy"
        }
    ]


def generate_flashcards(text: str, count: int = 8) -> List[Dict[str, Any]]:
    """Generate high-yield revision flashcards in structured JSON format."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Document text is empty.")

    safe_text = _budget_text(text, max_chars=80000)
    prompt = f"""
You are a study techniques expert specializing in active recall and spaced repetition.
Create {count} high-yield study flashcards based on the document below.

Return ONLY a valid JSON array of objects. Do not include introductory text.
Each card MUST follow this exact JSON schema:
[
  {{
    "id": 1,
    "category": "Key Concept / Definition / Formula / Fact",
    "front": "Prompt or Question (e.g. What is X? How does Y work?)",
    "back": "Clear, concise answer and explanation."
  }}
]

Document:
\"\"\"
{safe_text}
\"\"\"
"""
    raw_response = _generate_with_fallback(prompt, temperature=0.3)
    clean_json = _clean_json_response(raw_response)
    try:
        data = json.loads(clean_json)
        if isinstance(data, list) and len(data) > 0:
            return data
    except Exception as e:
        logger.error(f"Failed to parse flashcards JSON: {e}. Raw: {raw_response[:300]}")

    return [
        {
            "id": 1,
            "category": "Core Concept",
            "front": "What is the core subject of this document?",
            "back": "The document covers the fundamental principles and concepts outlined in its sections."
        }
    ]


def translate_pdf(text: str, language: str) -> str:
    """Translate document text into chosen language."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Document text is empty.")

    safe_text = _budget_text(text, max_chars=50000)
    prompt = f"""
You are a master professional translator.
Translate the following document content into {language}.

Rules:
- Preserve the exact meaning, tone, and technical terminology.
- Preserve all Markdown headers, bullet points, and formatting structure.
- Do NOT add commentary. Return ONLY the translated content.

Content:
\"\"\"
{safe_text}
\"\"\"
"""
    return _generate_with_fallback(prompt, temperature=0.2)


def extract_insights(text: str) -> Dict[str, Any]:
    """Extract quick high-level metadata: 3-minute read, key concepts, reading time."""
    if not text.strip():
        return {"reading_time_mins": 0, "key_concepts": [], "summary_snippet": ""}

    words = len(text.split())
    reading_time = max(1, round(words / 200))

    safe_text = _budget_text(text, max_chars=30000)
    prompt = f"""
Extract 5 essential key concepts or technical terms defined or central to this document, along with a 1-sentence definition for each.
Return ONLY a valid JSON object:
{{
  "key_concepts": [
    {{"term": "Term Name", "definition": "One sentence explanation"}}
  ]
}}

Document:
\"\"\"
{safe_text}
\"\"\"
"""
    try:
        raw_response = _generate_with_fallback(prompt, temperature=0.2)
        clean_json = _clean_json_response(raw_response)
        parsed = json.loads(clean_json)
        return {
            "reading_time_mins": reading_time,
            "key_concepts": parsed.get("key_concepts", []),
        }
    except Exception:
        return {
            "reading_time_mins": reading_time,
            "key_concepts": []
        }