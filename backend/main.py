import fitz
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.services.nlp_engine import nlp_engine
from app.core.database import engine, Base, get_db
from app.models.sql_models import AnalysisRecord
from app.services.vector_store import vector_db


# Create database tables (SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ClauseWatch AI API",
    description="API for contract analysis using deterministic NLP and Hybrid Persistence.",
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
async def analyze_contract(
    file: UploadFile = File(...), db: Session = Depends(get_db)  # Inject SQL Session
):
    # 1. Validation
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only PDF allowed."
        )

    try:
        content = await file.read()
        paragraphs = extract_text_from_pdf(content)

        # Analyze with NLP Engine
        analyzed_clauses = []
        risky_count = 0

        # Limit to 50 clauses for performance
        for p in paragraphs[:50]:
            result = nlp_engine.analyze_clause(p)
            if result:
                analyzed_clauses.append(result)
                if result["is_risky"]:
                    risky_count += 1

        # Calculate Statistics
        total = len(analyzed_clauses)
        risk_score = 0
        if total > 0:
            risk_score = int((risky_count / total) * 100)

        #  PERSISTENCE LAYER
        db_record = AnalysisRecord(
            filename=file.filename,
            risk_score=risk_score,
            total_clauses=total,
            risky_clauses=risky_count,
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        # PERSISTENCE LAYER B: Vector Store (RAG / Context)
        try:
            vector_db.add_contract(file.filename, paragraphs)
            print(f"Indexation complete for {file.filename}")
        except Exception as vec_error:
            print(f"Vector DB Error (Non-blocking): {vec_error}")

        # Return JSON to Frontend
        return ContractAnalysisResponse(
            filename=file.filename,
            risk_score=risk_score,
            total_clauses_analyzed=total,
            risky_clauses_count=risky_count,
            details=analyzed_clauses,
        )

    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/history")
def get_history(db: Session = Depends(get_db)):
    history = (
        db.query(AnalysisRecord)
        .order_by(AnalysisRecord.upload_date.desc())
        .limit(10)
        .all()
    )
    return history
