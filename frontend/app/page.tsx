"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Upload,
    FileText,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Search,
    ArrowRight,
    X,
    MessageSquare,
    Sparkles,
} from "lucide-react";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- Types ---
interface ClauseAnalysis {
    text_snippet: string;
    label: string;
    confidence: number;
    is_risky: boolean;
}

interface AnalysisResult {
    filename: string;
    language: string;
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
        page: number;
    };
}

export default function LegalDashboard() {
    // --- States ---
    const [file, setFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null); // NUEVO: Para previsualizar el PDF
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Search States
    const [query, setQuery] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const [explanations, setExplanations] = useState<{ [key: number]: string }>(
        {}
    );
    const [explainingState, setExplainingState] = useState<{
        [key: number]: boolean;
    }>({});
    // --- Handlers ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setError(null);
            setResult(null);
            setSearchResults([]);
            setQuery("");

            // Creamos una URL temporal para visualizar el PDF en el navegador
            const objectUrl = URL.createObjectURL(selectedFile);
            setPdfUrl(objectUrl);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                `${API_URL}/api/v1/analyze`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
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
            const response = await axios.post(
                `${API_URL}/api/v1/search`,
                {
                    query: query,
                    filename: result.filename,
                    doc_language: result.language || "es",
                    top_k: 3,
                }
            );
            setSearchResults(response.data.results);
        } catch (err) {
            console.error(err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleExplain = async (
        index: number,
        text: string,
        userQuery: string
    ) => {
        if (explanations[index]) {
            const newExpl = { ...explanations };
            delete newExpl[index];
            setExplanations(newExpl);
            return;
        }

        setExplainingState((prev) => ({ ...prev, [index]: true }));

        try {
            const response = await axios.post(
                `${API_URL}/api/v1/explain`,
                {
                    text: text,
                    query: userQuery,
                }
            );
            setExplanations((prev) => ({
                ...prev,
                [index]: response.data.explanation,
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setExplainingState((prev) => ({ ...prev, [index]: false }));
        }
    };

    // Limpiar memoria de la URL del PDF cuando el componente se desmonta
    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    return (
        // ESTRUCTURA PRINCIPAL: Pantalla dividida (H-SCREEN)
        <main className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* --- PANEL IZQUIERDO: Interacción y Análisis (Scrollable) --- */}
            <div className="w-1/2 h-full flex flex-col border-r border-slate-200 bg-white">
                {/* Header Fijo */}
                <header className="p-6 border-b border-slate-100 bg-white z-10">
                    <h1 className="text-2xl font-bold tracking-tight text-indigo-900 flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <FileText className="text-white w-5 h-5" />
                        </div>
                        LegalShield AI
                    </h1>
                </header>

                {/* Contenido con Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* 1. Upload Section (Compacta) */}
                    <div
                        className={`transition-all duration-300 ${
                            result ? "p-4 border-b border-slate-100" : "py-10"
                        }`}
                    >
                        {!result && (
                            <div className="text-center mb-6">
                                <h2 className="text-lg font-medium text-slate-700">
                                    Comienza el análisis
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    Sube tu contrato para detectar riesgos y
                                    chatear con él.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 items-center justify-center">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-200">
                                <Upload className="w-4 h-4" />
                                {file ? "Cambiar Archivo" : "Subir PDF"}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </label>

                            <button
                                onClick={handleAnalyze}
                                disabled={!file || loading}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    "Analizar Riesgos"
                                )}
                            </button>
                        </div>
                        {file && !result && (
                            <p className="text-center text-xs text-slate-400 mt-2">
                                {file.name}
                            </p>
                        )}
                        {error && (
                            <p className="text-red-500 text-sm text-center mt-2">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* 2. RESULTADOS DEL ANÁLISIS */}
                    {result && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Score Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-slate-700">
                                        Nivel de Riesgo Global
                                    </h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                            result.risk_score > 50
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {result.risk_score > 50
                                            ? "Alto Riesgo"
                                            : "Seguro"}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-1000 ${
                                            result.risk_score > 50
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                        style={{
                                            width: `${result.risk_score}%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 text-right">
                                    {result.risk_score}/100 Puntos
                                </p>
                            </div>

                            {/* CHAT SECTION CON BOTÓN DE EXPLICACIÓN */}
                            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-indigo-900 font-semibold border-b border-indigo-200 pb-2">
                                    <MessageSquare className="w-5 h-5" />
                                    <h3>Chat con el Contrato</h3>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ej: ¿Puedo cancelar?"
                                        className="flex-1 p-3 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && handleSearch()
                                        }
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={searchLoading || !query}
                                        className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {searchLoading ? (
                                            <Loader2 className="animate-spin w-5 h-5" />
                                        ) : (
                                            <ArrowRight className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {!searchLoading &&
                                        query &&
                                        searchResults.length === 0 && (
                                            <p className="text-center text-xs text-slate-500 italic">
                                                No se encontró información.
                                            </p>
                                        )}

                                    {searchResults.map((res, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm text-sm hover:border-indigo-300 transition-colors group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 min-w-[20px]">
                                                    <Search className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div className="w-full space-y-2">
                                                    <p className="text-slate-700 leading-relaxed">
                                                        {res.text}
                                                    </p>

                                                    {/* --- AQUÍ ESTÁ EL BOTÓN DE EXPLICACIÓN --- */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            // Pasamos 'query' como tercer argumento
                                                            onClick={() =>
                                                                handleExplain(
                                                                    idx,
                                                                    res.text,
                                                                    query
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                        >
                                                            {explainingState[
                                                                idx
                                                            ] ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                            )}
                                                            {explanations[idx]
                                                                ? "Ocultar Explicación"
                                                                : "Analizar con IA"}
                                                        </button>
                                                    </div>

                                                    {/* LA TARJETA DE EXPLICACIÓN */}
                                                    {explanations[idx] && (
                                                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs animate-in fade-in slide-in-from-top-1 shadow-sm">
                                                            <div className="flex gap-2 items-start">
                                                                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                                <div className="whitespace-pre-line leading-relaxed font-medium">
                                                                    {
                                                                        explanations[
                                                                            idx
                                                                        ]
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                                            Página{" "}
                                                            {res.metadata
                                                                .page || "?"}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            Coincidencia:{" "}
                                                            {(
                                                                res.similarity_score *
                                                                100
                                                            ).toFixed(0)}
                                                            %
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- DETECTED RISKS (Highlight Simulation) --- */}
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Cláusulas Detectadas
                                </h3>
                                <div className="space-y-3">
                                    {result.details.map((clause, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-default ${
                                                clause.is_risky
                                                    ? "bg-red-50 border-red-200"
                                                    : "bg-white border-slate-200"
                                            }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5">
                                                    {clause.is_risky ? (
                                                        <X className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4
                                                        className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                                            clause.is_risky
                                                                ? "text-red-700"
                                                                : "text-slate-600"
                                                        }`}
                                                    >
                                                        {clause.label}
                                                    </h4>
                                                    <p className="text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3 py-1">
                                                        "{clause.text_snippet}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- PANEL DERECHO: VISOR DE PDF --- */}
            <div className="w-1/2 h-full bg-slate-800 flex items-center justify-center relative">
                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0`} // Ocultamos toolbar básica
                        className="w-full h-full"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="text-center text-slate-400 p-10">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">
                            Vista Previa del Documento
                        </p>
                        <p className="text-sm opacity-60">
                            Sube un PDF para verlo aquí
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
