from fastapi import FastAPI

app = FastAPI(title="IntelliPDF API")


@app.get("/")
def home():
    return {"message": "Welcome to IntelliPDF API 🚀"}