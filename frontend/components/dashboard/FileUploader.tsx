import { Upload, Loader2, Shield } from "lucide-react";
import { Translation } from "@/lib/translations";

interface FileUploaderProps {
  file: File | null;
  loading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  t: Translation;
}

export default function FileUploader({
  file,
  loading,
  onFileChange,
  onAnalyze,
  t,
}: FileUploaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* --- BUTTON SELECT --- */}
      <label
        className={`
          cursor-pointer flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-300
          ${
            file
              ? "bg-[#EEE5D9]/30 border-[#D2B68A] text-[#222D52]" 
              : "bg-[#FDFFFF] border-[#222D52]/20 text-[#222D52]/60 hover:border-[#D2B68A] hover:bg-[#EEE5D9]/20" 
          }
        `}
      >
        <Upload className={`w-5 h-5 ${file ? "text-[#D2B68A]" : "text-[#222D52]/60"}`} />
        <span className="font-medium text-sm truncate">
          {file ? file.name : t.uploadDefault}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={onFileChange}
        />
      </label>

      {/* --- BUTTON --- */}
      <button
        onClick={onAnalyze}
        disabled={!file || loading}
        className={`
            flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all duration-300 shadow-md
            disabled:opacity-50 disabled:cursor-not-allowed
            
            bg-[#D2B68A]/80 text-[#222D52]
            
            hover:bg-[#222D52] hover:text-[#D2B68A] hover:shadow-lg
        `}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Shield className="w-5 h-5" />
        )}
        {loading ? t.analyzing : t.analyzeBtn}
      </button>
    </div>
  );
}