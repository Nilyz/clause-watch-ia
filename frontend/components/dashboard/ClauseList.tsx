import { AlertTriangle, CheckCircle } from "lucide-react";
import { ClauseAnalysis } from "@/lib/types";
import { Translation } from "@/lib/translations";

interface ClauseListProps {
    clauses: ClauseAnalysis[];
    count: number;
    t: Translation;
}

export default function ClauseList({ clauses, count, t }: ClauseListProps) {
    return (
        <div className="bg-[#FDFFFF] border border-[#D2B68A]/40 rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-bottom-8">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D2B68A]/20">
                <div className="flex items-center gap-2 text-[#222D52]">
                    <AlertTriangle className="w-5 h-5 text-[#D2B68A]" />
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                        {t.detectedClauses}
                    </h2>
                </div>

                {/* BADGE */}
                <span className="text-[10px] font-bold bg-[#222D52] text-[#D2B68A] px-3 py-1 rounded-full shadow-sm">
                    {count} {t.risksFound}
                </span>
            </div>

            {/* CARD LIST */}
            <div className="space-y-4">
                {clauses.map((clause, idx) => {
                    const isRisky = clause.is_risky;
                    return (
                        <div
                            key={idx}
                            className={`
                p-5 rounded-xl border transition-all duration-300 hover:shadow-md
                ${
                    isRisky
                        ? "bg-red-50 border-red-100"
                        : "bg-green-50 border-green-100"
                }
              `}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3
                                    className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
                                        isRisky
                                            ? "text-red-800"
                                            : "text-green-800"
                                    }`}
                                >
                                    {isRisky ? (
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                    ) : (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    )}
                                    {clause.label}
                                </h3>
                            </div>

                            <p className="text-sm text-[#222D52]/80 font-serif leading-relaxed italic">
                                "{clause.text_snippet}"
                            </p>
                        </div>
                    );
                })}

                {clauses.length === 0 && (
                    <div className="text-center py-6 text-[#222D52]/40 text-sm font-serif italic">
                        {t.noClauseDisplay}
                    </div>
                )}
            </div>
        </div>
    );
}
