"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, Search, ArrowRight } from "lucide-react";

// --- Types ---
interface ClauseAnalysis {
  text_snippet: string; 
  label: string;
  confidence: number;
  is_risky: boolean;
}

interface AnalysisResult {
  language: string;
  filename: string;
  risk_score: number;
  total_clauses_analyzed: number;
  risky_clauses_count: number;
  details: ClauseAnalysis[];
}

interface SearchResult {
  text: string;
  similarity_score: number;
  metadata: {
    chunk_index: number;
    filename: string;
  };
}

export default function LegalDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
      setSearchResults([]);
      setQuery("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze document. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query || !result) return;
    setSearchLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/search", {
        query: query,
        filename: result.filename,
        doc_language: result.language,
        top_k: 3
      });
      setSearchResults(response.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-indigo-900">
            ClauseWatch AI
          </h1>
          <p className="text-slate-500">
            Smart Contract Analysis & Semantic Search
          </p>
        </header>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-indigo-50 rounded-full">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            
            <div className="space-y-2">
              <label className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
                Select Contract (PDF)
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-sm text-slate-400">
                {file ? file.name : "No file selected"}
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`w-full max-w-xs flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                !file || loading ? "bg-slate-300" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Analyze Document"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Risk Score Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-slate-400" />
                  Analysis Report
                </h2>
                <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                  result.risk_score > 50 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}>
                  Risk Score: {result.risk_score}/100
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${result.risk_score > 50 ? "bg-red-500" : "bg-green-500"}`} 
                  style={{ width: `${result.risk_score}%` }}
                ></div>
              </div>
            </div>

            {/* --- Chat section --- */}
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Ask the Contract
              </h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ex: Can I cancel the contract anytime?"
                  className="flex-1 p-3 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  disabled={searchLoading || !query}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {searchLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                </button>
              </div>

              {/* Search Results */}
              <div className="space-y-3">
                {searchResults.map((res, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-indigo-100 text-sm text-slate-700 shadow-sm animate-in fade-in">
                    <p className="italic text-slate-500 mb-1 text-xs">
                      Relevant Clause (Match: {(res.similarity_score * 100).toFixed(0)}%)
                    </p>
                    <p>{res.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Clauses List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-700">Identified Risks</h3>
              {result.details.map((clause, idx) => (
                <div key={idx} className={`p-4 rounded-lg border flex items-start space-x-4 ${
                    clause.is_risky ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
                  }`}>
                  <div className="mt-1">
                    {clause.is_risky ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${clause.is_risky ? "text-red-800" : "text-slate-700"}`}>
                      {clause.label}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">"{clause.text_snippet}"</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}