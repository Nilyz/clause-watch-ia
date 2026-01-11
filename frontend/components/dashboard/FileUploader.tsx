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
            {/* Botón Selección */}
            <label
                className={`
          cursor-pointer flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all
          ${
              file
                  ? "bg-legal-surface border-primary/50 text-primary"
                  : "bg-legal-surface border-legal-border hover:border-legal-muted hover:bg-legal-border text-legal-muted"
          }
      `}
            >
                <Upload className="w-5 h-5" />
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

            {/* Botón Acción */}
            <button
                onClick={onAnalyze}
                disabled={!file || loading}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
