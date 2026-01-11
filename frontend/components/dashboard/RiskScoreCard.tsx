import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import { Translation } from "@/lib/translations";

interface RiskScoreCardProps {
    result: AnalysisResult;
    t: Translation;
}

export default function RiskScoreCard({ result, t }: RiskScoreCardProps) {
    const isHighRisk = result.risk_score > 50;

    return (
        <div className="bg-legal-surface border border-legal-border rounded-2xl p-6 shadow-xl relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2">
            {/* Glow Effect */}
            <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 ${
                    isHighRisk ? "bg-risk-high" : "bg-risk-safe"
                }`}
            ></div>

            <div className="relative z-10 flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-legal-muted mb-1 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> {t.riskScoreTitle}
                    </h2>
                    <div className="flex items-baseline gap-2">
                        <span
                            className={`text-5xl font-serif font-bold ${
                                isHighRisk ? "text-red-400" : "text-green-400"
                            }`}
                        >
                            {result.risk_score}
                        </span>
                        <span className="text-lg text-legal-muted font-medium">
                            / 100
                        </span>
                    </div>
                </div>

                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                        isHighRisk
                            ? "bg-red-950/30 border-red-900 text-red-400"
                            : "bg-green-950/30 border-green-900 text-green-400"
                    }`}
                >
                    {isHighRisk ? (
                        <AlertTriangle className="w-4 h-4" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wide">
                        {isHighRisk ? t.riskHigh : t.riskLow}
                    </span>
                </div>
            </div>

            <div className="h-2 w-full bg-legal-bg rounded-full overflow-hidden border border-legal-border">
                <div
                    className={`h-full transition-all duration-1000 ease-out ${
                        isHighRisk
                            ? "bg-risk-high shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                            : "bg-risk-safe shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    }`}
                    style={{ width: `${result.risk_score}%` }}
                ></div>
            </div>
        </div>
    );
}
