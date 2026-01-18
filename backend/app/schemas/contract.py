from pydantic import BaseModel
from typing import List, Optional

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