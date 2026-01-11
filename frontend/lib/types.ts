export interface ClauseAnalysis {
    text_snippet: string;
    label: string;
    confidence: number;
    is_risky: boolean;
}

export interface AnalysisResult {
    filename: string;
    language: string;
    risk_score: number;
    total_clauses_analyzed: number;
    risky_clauses_count: number;
    details: ClauseAnalysis[];
}

export interface SearchResult {
    text: string;
    similarity_score: number;
    metadata: {
        chunk_index: number;
        filename: string;
        page: number;
    };
}
