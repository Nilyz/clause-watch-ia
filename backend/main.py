import fitz
import os
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from deep_translator import GoogleTranslator
from langdetect import detect
from dotenv import load_dotenv
from app.services.nlp_engine import nlp_engine
from app.core.database import engine, Base, get_db
from app.models.sql_models import AnalysisRecord
from app.services.vector_store import vector_db

# --- CONFIGURATION ---
load_dotenv()

api_key = os.getenv("API_KEY_GEMINI")
if not api_key:
    print("WARNING: API_KEY_GEMINI not found in .env file")
else:
    genai.configure(api_key=api_key.strip())

model = genai.GenerativeModel("gemini-2.5-flash")

# Create database tables
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
    language: str
    risk_score: int
    total_clauses_analyzed: int
    risky_clauses_count: int
    details: List[ClauseAnalysis]


class SearchQuery(BaseModel):
    query: str
    filename: str
    doc_language: str = "es"
    top_k: int = 3


class SearchResultItem(BaseModel):
    text: str
    similarity_score: float
    metadata: dict


class SearchResponse(BaseModel):
    results: List[SearchResultItem]


class ExplainRequest(BaseModel):
    text: str
    query: Optional[str] = None


# --- Helper Functions ---
def extract_text_with_metadata(file_content: bytes) -> List[dict]:

    doc = fitz.open(stream=file_content, filetype="pdf")
    chunks_data = []

    for page_num, page in enumerate(doc):
        blocks = page.get_text("blocks")

        for block in blocks:
            text_block = block[4].strip()

            clean_text = " ".join(text_block.splitlines())

            if len(clean_text) > 50:
                # split by sentences if too long
                if len(clean_text) > 300:
                    sentences = clean_text.split(". ")
                    for sentence in sentences:
                        if len(sentence) > 30:
                            final_sent = sentence.strip().rstrip(".") + "."

                            chunks_data.append(
                                {"text": final_sent, "page": page_num + 1}
                            )
                else:
                    final_text = clean_text.strip().rstrip(".") + "."
                    chunks_data.append({"text": final_text, "page": page_num + 1})

    return chunks_data


# --- Endpoints ---
@app.get("/")
def health_check():
    return {"status": "ok", "service": "ClauseWatch AI Backend"}


@app.post("/api/v1/analyze", response_model=ContractAnalysisResponse)
async def analyze_contract(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Validation
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only PDF allowed."
        )

    try:
        content = await file.read()
        chunks_with_meta = extract_text_with_metadata(content)

        if not chunks_with_meta:
            raise HTTPException(
                status_code=400, detail="No text found in PDF. Is it scanned?"
            )

        # Detect Language (using first 5 chunks)
        full_text_sample = " ".join([c["text"] for c in chunks_with_meta[:5]])
        detected_lang = "es"
        try:
            detected_lang = detect(full_text_sample)
        except:
            pass

        # 2. NLP Analysis (Risk Detection)
        analyzed_clauses = []
        risky_count = 0

        # Limit to 100 clauses for performance
        for item in chunks_with_meta[:100]:
            text = item["text"]
            result = nlp_engine.analyze_clause(text)

            if result:
                analyzed_clauses.append(result)
                if result["is_risky"]:
                    risky_count += 1

        # Calculate Risk Score
        total = len(analyzed_clauses)
        risk_score = 0
        if total > 0:
            risk_score = int((risky_count / total) * 100)

        # 3. Persistence Layer A: SQL (History)
        db_record = AnalysisRecord(
            filename=file.filename,
            risk_score=risk_score,
            total_clauses=total,
            risky_clauses=risky_count,
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        # 4. Persistence Layer B: Vector Store (RAG Context)
        try:
            vector_db.add_contract(file.filename, chunks_with_meta)
            print(f"Indexation complete for {file.filename}")
        except Exception as vec_error:
            print(f"Vector DB Error (Non-blocking): {vec_error}")

        return ContractAnalysisResponse(
            filename=file.filename,
            language=detected_lang,
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


@app.post("/api/v1/search", response_model=SearchResponse)
def search_contract(search_data: SearchQuery):
    final_query = search_data.query

    # --- Translation Logic (User Language -> Doc Language) ---
    try:
        query_lang = detect(search_data.query)
        # If user language differs from doc language, translate
        if query_lang != search_data.doc_language:
            translator = GoogleTranslator(
                source="auto", target=search_data.doc_language
            )
            translated_text = translator.translate(search_data.query)
            final_query = translated_text
    except Exception as e:
        print(f"Translation warning: {e}")
    # ---------------------------------------------------------

    print(f"SEARCHING: '{final_query}' in file: '{search_data.filename}'")

    try:
        results = vector_db.search_similar(
            final_query, filename=search_data.filename, n_results=search_data.top_k
        )

        formatted_results = []
        seen_texts = set()

        if results and results["documents"]:
            documents = results["documents"][0]
            metadatas = results["metadatas"][0]
            distances = results["distances"][0]

            for i in range(len(documents)):
                text_content = documents[i]

                # Deduplication check
                if text_content in seen_texts:
                    continue

                seen_texts.add(text_content)

                formatted_results.append(
                    {
                        "text": text_content,
                        "metadata": metadatas[i],
                        "similarity_score": 1 - distances[i],
                    }
                )

        return SearchResponse(results=formatted_results)

    except Exception as e:
        print(f"Search Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/explain")
def explain_clause(request: ExplainRequest):
    text_snippet = request.text
    user_question = request.query

    print(f"Gemini explaining: {text_snippet[:30]}... (Context: {user_question})")

    # --- DYNAMIC PROMPT CONSTRUCTION ---
    if user_question:
        context_instruction = f"The user has this specific question: '{user_question}'. YOUR MAIN GOAL IS TO ANSWER THIS QUESTION using the clause information."
    else:
        context_instruction = (
            "The user wants to understand what this legal clause means in simple terms."
        )

    prompt = f"""
    Act as an expert and friendly lawyer.
    You have a legal clause and a user question/intent.
    
    LEGAL TEXT: "{text_snippet}"
    
    INSTRUCTION: {context_instruction}
    
    Rules:
    1. Use a professional but approachable tone.
    2. Do not start with greetings or sign-offs.
    3. **CRITICAL: Respond in the same language as the user's question (or Spanish if the question is missing).**
    4. If you don't understand the clause, state it clearly.
    5. If the clause answers the question, state it clearly (e.g., "Yes, you can...", "No, because...").
    6. Explain the risk or obligation in simple terms for a general audience.
    7. Maximum 3 lines of output.
    """

    try:
        response = model.generate_content(prompt)
        explanation = response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {e}")
        explanation = (
            "Could not connect to AI Assistant. Please review the clause manually."
        )

    return {"explanation": explanation}


# uvicorn main:app --reload
