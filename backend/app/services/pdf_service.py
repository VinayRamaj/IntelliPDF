import fitz


def extract_text_from_pdf(pdf_path: str):
    document = fitz.open(pdf_path)

    text = ""

    for page in document:
        text += page.get_text()

    page_count = len(document)

    document.close()

    return {
        "text": text,
        "pages": page_count,
        "characters": len(text)
    }