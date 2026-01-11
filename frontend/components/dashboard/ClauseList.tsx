import { AlertTriangle } from "lucide-react";
import { ClauseAnalysis } from "@/lib/types";
import { Translation } from "@/lib/translations";

interface ClauseListProps {
    clauses: ClauseAnalysis[];
    count: number;
    t: Translation;
}

export default function ClauseList({ clauses, count, t }: ClauseListProps) {
    return (
        <div className="bg-legal-surface/50 border border-legal-border rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-risk-high">
                    <AlertTriangle className="w-5 h-5" />
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                        {t.detectedClauses}
                    </h2>
                </div>
                <span className="text-xs bg-legal-border text-legal-muted px-2 py-1 rounded-full">
                    {count} {t.risksFound}
                </span>
            </div>

            <div className="space-y-3">
                {clauses.map((clause, idx) => {
                    const isRisky = clause.is_risky;
                    return (
                        <div
                            key={idx}
                            className={`
                p-4 rounded-lg border-l-4 transition-all
                ${
                    isRisky
                        ? "bg-red-500/5 border-risk-high border-t border-r border-b border-t-risk-high/20 border-r-risk-high/20 border-b-risk-high/20"
                        : "bg-green-500/5 border-risk-safe border-t-risk-safe/20"
                }
              `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3
                                    className={`text-xs font-bold uppercase ${
                                        isRisky
                                            ? "text-red-400"
                                            : "text-green-400"
                                    }`}
                                >
                                    {clause.label}
                                </h3>
                            </div>
                            <p className="text-sm text-legal-muted line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                                "{clause.text_snippet}"
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
