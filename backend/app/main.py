from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.upload import router as upload_router


from app.api.ai import router as ai_router


app = FastAPI(title="IntelliPDF API")

# Serve uploaded PDFs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

app.include_router(ai_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to IntelliPDF API 🚀"
    }