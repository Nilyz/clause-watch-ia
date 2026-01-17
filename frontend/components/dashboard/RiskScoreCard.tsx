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
    <div className="bg-[#D2B68A]/5 border border-[#D2B68A]/40 rounded-2xl p-6 shadow-md relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2">
      

      <div className="relative z-10 flex justify-between items-end mb-6">
        <div>
          {/* TITLE */}
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#222D52] mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D2B68A]" /> {t.riskScoreTitle}
          </h2>
          
          {/* SCORE */}
          <div className="flex items-baseline gap-2">
            <span
              className={`text-5xl font-serif font-bold ${
                isHighRisk ? "text-red-700" : "text-green-700"
              }`}
            >
              {result.risk_score}
            </span>
            <span className="text-lg text-[#222D52]/40 font-medium">
              / 100
            </span>
          </div>
        </div>

        {/* BADGE */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isHighRisk
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
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

      {/* BAR */}
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div
          className={`h-full transition-all duration-1000 ease-out ${
            isHighRisk
              ? "bg-red-700 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
              : "bg-green-700 shadow-[0_0_10px_rgba(22,163,74,0.3)]"
          }`}
          style={{ width: `${result.risk_score}%` }}
        ></div>
      </div>
    </div>
  );
}