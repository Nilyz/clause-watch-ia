"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";

// --- Imports de tu nueva estructura modular ---
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FileUploader from "@/components/dashboard/FileUploader";
import RiskScoreCard from "@/components/dashboard/RiskScoreCard";
import ChatAssistant from "@/components/dashboard/ChatAssistant";
import ClauseList from "@/components/dashboard/ClauseList";
import PdfViewer from "@/components/dashboard/PdfViewer";

import { TRANSLATIONS, Language } from "@/lib/translations";
import { AnalysisResult, SearchResult } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function LegalDashboard() {
    // --- States ---
    const [file, setFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Idioma
    const [language, setLanguage] = useState<Language>("es");
    const t = TRANSLATIONS[language];

    // Chat States
    const [query, setQuery] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    // (Opcional) Podrías mover la lógica de explicaciones dentro de ChatAssistant,
    // pero dejarla aquí está bien para empezar.
    const [explanations, setExplanations] = useState<{ [key: number]: string }>(
        {}
    );
    const [explainingState, setExplainingState] = useState<{
        [key: number]: boolean;
    }>({});

    // --- Handlers ---
    const toggleLanguage = () =>
        setLanguage((prev) => (prev === "es" ? "en" : "es"));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setError(null);
            setResult(null);
            setSearchResults([]);
            setQuery("");
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
                formData
            );
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError(t.errorConnection);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!query || !result) return;
        setSearchLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/v1/search`, {
                query: query,
                filename: result.filename,
                doc_language: result.language || "es",
                top_k: 3,
            });
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
        // Si ya existe explicación, la borramos (toggle)
        if (explanations[index]) {
            const newExpl = { ...explanations };
            delete newExpl[index];
            setExplanations(newExpl);
            return;
        }

        setExplainingState((prev) => ({ ...prev, [index]: true }));

        try {
            let queryToSend = userQuery;

            if (!queryToSend || queryToSend.trim() === "") {
                queryToSend =
                    language === "en"
                        ? "Explain this clause in simple terms"
                        : "Explícame esta cláusula en términos sencillos";
            }

            const response = await axios.post(`${API_URL}/api/v1/explain`, {
                text: text,
                query: queryToSend,
            });

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

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    return (
        <div className="flex flex-col min-h-screen bg-legal-bg font-sans text-legal-text transition-colors duration-500">
            <Header t={t} lang={language} toggleLang={toggleLanguage} />

            <main className="container mx-auto px-6 py-8 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* COLUMNA IZQUIERDA (Dashboard) */}
                    <div className="lg:col-span-7 space-y-6">
                        <FileUploader
                            file={file}
                            loading={loading}
                            onFileChange={handleFileChange}
                            onAnalyze={handleAnalyze}
                            t={t}
                        />

                        {error && (
                            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        {result && <RiskScoreCard result={result} t={t} />}

                        {result && (
                            <ChatAssistant
                                t={t}
                                query={query}
                                setQuery={setQuery}
                                handleSearch={handleSearch}
                                loading={searchLoading}
                                results={searchResults}
                                onExplain={handleExplain}
                                explanations={explanations}
                                explainingState={explainingState}
                            />
                        )}

                        {result && (
                            <ClauseList
                                clauses={result.details}
                                t={t}
                                count={result.risky_clauses_count}
                            />
                        )}
                    </div>

                    {/* COLUMNA DERECHA (PDF) */}
                    <div className="lg:col-span-5 sticky top-24">
                        <PdfViewer pdfUrl={pdfUrl} t={t} />
                    </div>
                </div>
            </main>

            <Footer t={t} />
        </div>
    );
}
