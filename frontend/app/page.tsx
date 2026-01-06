"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

// --- Types (Matching Backend Pydantic Models) ---
interface ClauseAnalysis {
  text_snippet: str;
  label: string;
  confidence: number;
  is_risky: boolean;
}

interface AnalysisResult {
  filename: string;
  risk_score: number;
  total_clauses_analyzed: number;
  risky_clauses_count: number;
  details: ClauseAnalysis[];
}

export default function LegalDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Pointing to FastAPI Backend
      const response = await axios.post("http://127.0.0.1:8000/api/v1/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze document. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-indigo-900">
            LegalShield AI
          </h1>
          <p className="text-slate-500">
            Secure, Deterministic Contract Analysis Powered by NLP
          </p>
        </header>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-indigo-50 rounded-full">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                Select Contract (PDF)
                <input 
                  id="file-upload" 
                  name="file-upload" 
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
              className={`w-full max-w-xs flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                !file || loading 
                  ? "bg-slate-300 cursor-not-allowed" 
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Analyzing...</>
              ) : (
                "Analyze Document"
              )}
            </button>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Score Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
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
              
              <div className="p-6 bg-slate-50">
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                      result.risk_score > 50 ? "bg-red-500" : "bg-green-500"
                    }`} 
                    style={{ width: `${result.risk_score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500">
                  Found {result.risky_clauses_count} potential risks in {result.total_clauses_analyzed} clauses analyzed.
                </p>
              </div>
            </div>

            {/* Clauses List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-700">Detailed Findings</h3>
              
              {result.details.map((clause, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border flex items-start space-x-4 transition-all hover:shadow-md ${
                    clause.is_risky 
                      ? "bg-red-50 border-red-200" 
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="mt-1">
                    {clause.is_risky ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className={`text-sm font-bold ${
                        clause.is_risky ? "text-red-800" : "text-slate-700"
                      }`}>
                        {clause.label}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Confidence: {(clause.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      "{clause.text_snippet}"
                    </p>
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