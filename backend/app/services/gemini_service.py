import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("models/gemini-3.5-flash")


def summarize_pdf(text: str):
    prompt = f"""
You are an expert study assistant.

Summarize the following PDF in simple language.

Rules:
- Use bullet points.
- Keep it concise.
- Mention important concepts.
- Suitable for students.

{text}
"""

    response = model.generate_content(prompt)
    return response.text


def ask_pdf(text: str, question: str):
    prompt = f"""
You are an AI assistant.

Answer ONLY using the information in the PDF below.

PDF:
{text}

Question:
{question}

If the answer is not present in the PDF, reply exactly:
"I couldn't find that information in the PDF."
"""

    response = model.generate_content(prompt)
    return response.text


def generate_notes(text: str):
    prompt = f"""
You are an expert teacher.

Generate clean exam notes from the following PDF.

Rules:
- Use headings
- Use bullet points
- Highlight important concepts
- Keep it concise
- Easy for revision

{text}
"""

    response = model.generate_content(prompt)
    return response.text


def translate_pdf(text: str, language: str):
    prompt = f"""
You are a professional translator.

Translate the following PDF into {language}.

Rules:
- Preserve the original meaning.
- Keep headings and bullet points.
- Do not summarize.
- Translate the complete content.
- Return only the translated text.

PDF:

{text}
"""

    response = model.generate_content(prompt)
    return response.text