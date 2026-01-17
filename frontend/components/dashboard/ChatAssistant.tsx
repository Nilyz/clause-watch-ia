import { MessageSquare, Loader2, Sparkles, Send } from "lucide-react";
import { SearchResult } from "@/lib/types";
import { Translation } from "@/lib/translations";

interface ChatAssistantProps {
  t: Translation;
  query: string;
  setQuery: (q: string) => void;
  handleSearch: () => void;
  loading: boolean;
  results: SearchResult[];
  onExplain: (index: number, text: string, query: string) => void;
  explanations: { [key: number]: string };
  explainingState: { [key: number]: boolean };
}

export default function ChatAssistant({ 
  t, query, setQuery, handleSearch, loading, results, 
  onExplain, explanations, explainingState 
}: ChatAssistantProps) {
  
  return (
  
    <div className="bg-[#EEE5D9]/40 border border-[#D2B68A]/20 rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#D2B68A]" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#222D52]">
            {t.consultAssistant}
        </h2>
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder={t.chatPlaceholder}
          className="
            flex-1 rounded-lg px-4 py-3 text-sm transition-colors
            bg-[#FDFFFF] border border-[#222D52]/10 text-[#222D52] placeholder-[#222D52]/40
            focus:outline-none focus:border-[#D2B68A] focus:ring-1 focus:ring-[#D2B68A]
          "
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button 
          onClick={handleSearch} 
          disabled={loading || !query} 
          className="
            bg-[#222D52] text-[#FDFFFF] border border-[#222D52]
            hover:bg-[#D2B68A] hover:border-[#D2B68A] hover:text-[#222D52]
            px-5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* RESULTS */}
      <div className="space-y-4">
        {results.map((res, idx) => (
          <div key={idx} className="bg-[#FDFFFF] border border-[#222D52]/5 rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:border-[#D2B68A]/30">
            
            <p className="text-sm text-[#222D52]/80 italic mb-3 font-serif leading-relaxed">
                "{res.text}"
            </p>
            
            <div className="flex justify-between items-center border-t border-[#EEE5D9] pt-3 mt-3">
              <span className="text-xs text-[#222D52]/50 font-mono font-bold">
                {t.page} {res.metadata.page || 1}
              </span>
              
              <button 
                onClick={() => onExplain(idx, res.text, query)}
                className="text-xs flex items-center gap-1.5 text-[#D2B68A] hover:text-[#222D52] font-bold uppercase tracking-wide transition-colors"
              >
                {explainingState[idx] ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                {explanations[idx] ? t.hideBtn : t.interpretBtn}
              </button>
            </div>
            
            {/* EXPLANATION */}
            {explanations[idx] && (
              <div className="mt-3 text-sm text-[#222D52] bg-[#EEE5D9]/30 p-4 rounded-lg border-l-2 border-[#D2B68A] animate-in fade-in">
                {explanations[idx]}
              </div>
            )}
          </div>
        ))}

        {results.length === 0 && !loading && (
          // EMPTY PLACEHOLDER
          <div className="h-16 border-2 border-dashed border-[#222D52]/10 rounded-xl flex items-center justify-center text-[#222D52]/40 text-xs bg-[#FDFFFF]/50">
            {t.chatEmpty}
          </div>
        )}
      </div>
    </div>
  );
}