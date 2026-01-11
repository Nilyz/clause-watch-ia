import { MessageSquare, Loader2, Sparkles } from "lucide-react";
import { SearchResult } from "@/lib/types";
import { Translation } from "@/lib/translations";

interface ChatAssistantProps {
    t: Translation;
    query: string;
    setQuery: (q: string) => void;
    handleSearch: () => void;
    loading: boolean;
    results: SearchResult[];
    // Props para la explicación (IA)
    onExplain: (index: number, text: string, query: string) => void;
    explanations: { [key: number]: string };
    explainingState: { [key: number]: boolean };
}

export default function ChatAssistant({
    t,
    query,
    setQuery,
    handleSearch,
    loading,
    results,
    onExplain,
    explanations,
    explainingState,
}: ChatAssistantProps) {
    return (
        <div className="bg-legal-surface/50 border border-legal-border rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-primary mb-4">
                <MessageSquare className="w-5 h-5" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                    {t.consultAssistant}
                </h2>
            </div>

            {/* Input Area */}
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder={t.chatPlaceholder}
                    className="flex-1 bg-legal-bg border border-legal-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-legal-text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || !query}
                    className="bg-legal-border hover:bg-legal-surface border border-legal-border text-legal-text px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "->"
                    )}
                </button>
            </div>

            {/* Resultados */}
            <div className="space-y-4">
                {results.map((res, idx) => (
                    <div
                        key={idx}
                        className="bg-primary-light border border-primary/20 rounded-lg p-4 transition-all hover:bg-primary/10"
                    >
                        <p className="text-sm text-legal-text italic mb-3">
                            "{res.text}"
                        </p>

                        <div className="flex justify-between items-center border-t border-primary/10 pt-3">
                            <span className="text-xs text-primary/70 font-mono">
                                {t.page} {res.metadata.page || 1}
                            </span>

                            <button
                                onClick={() => onExplain(idx, res.text, query)}
                                className="text-xs flex items-center gap-1 text-primary hover:text-primary-hover font-semibold uppercase tracking-wide"
                            >
                                {explainingState[idx] ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Sparkles className="w-3 h-3" />
                                )}
                                {explanations[idx] ? t.hideBtn : t.interpretBtn}
                            </button>
                        </div>

                        {explanations[idx] && (
                            <div className="mt-3 text-sm text-legal-text bg-legal-bg/50 p-3 rounded border-l-2 border-primary animate-in fade-in">
                                {explanations[idx]}
                            </div>
                        )}
                    </div>
                ))}

                {results.length === 0 && !loading && (
                    <div className="h-12 border-2 border-dashed border-legal-border rounded-lg flex items-center justify-center text-legal-muted text-xs">
                        {t.chatEmpty}
                    </div>
                )}
            </div>
        </div>
    );
}
