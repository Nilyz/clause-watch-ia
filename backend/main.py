import fitz
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.nlp_engine import nlp_engine
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ClauseWatch AI API",
    description="API for contract analysis using deterministic NLP (BERT-based).",
    version="1.0.0",
)

# --- CORS CONFIGURATION ---
origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---
class ClauseAnalysis(BaseModel):
    text_snippet: str
    label: str
    confidence: float
    is_risky: bool


class ContractAnalysisResponse(BaseModel):
    filename: str
    risk_score: int
    total_clauses_analyzed: int
    risky_clauses_count: int
    details: List[ClauseAnalysis]


# --- Helper Functions ---
def extract_text_from_pdf(file_content: bytes) -> List[str]:
    doc = fitz.open(stream=file_content, filetype="pdf")
    paragraphs = []

    for page in doc:
        text = page.get_text("text")

        raw_paras = text.split("\n\n")
        for p in raw_paras:
            clean_text = p.strip()
            if len(clean_text) > 20:
                paragraphs.append(clean_text)

    return paragraphs


# --- Endpoints ---
@app.get("/")
def health_check():
    return {"status": "ok", "service": "ClauseWatch AI Backend"}


@app.post("/api/v1/analyze", response_model=ContractAnalysisResponse)
async def analyze_contract(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only PDF allowed."
        )

    try:
        content = await file.read()

        paragraphs = extract_text_from_pdf(content)

        # Analyze each paragraph with BERT
        analyzed_clauses = []
        risky_count = 0

        # Limit to first 50 paragraphs for performance in this demo
        for p in paragraphs[:50]:
            result = nlp_engine.analyze_clause(p)
            if result:
                analyzed_clauses.append(result)
                if result["is_risky"]:
                    risky_count += 1

        # Calculate Risk Score
        total = len(analyzed_clauses)
        risk_score = 0
        if total > 0:
            risk_score = int((risky_count / total) * 100)

        return ContractAnalysisResponse(
            filename=file.filename,
            risk_score=risk_score,
            total_clauses_analyzed=total,
            risky_clauses_count=risky_count,
            details=analyzed_clauses,
        )

    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(
            status_code=500, detail="Internal Server Error processing the PDF."
        )

#uvicorn main:app --reload