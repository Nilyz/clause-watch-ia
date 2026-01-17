import { FileText } from "lucide-react";
import { Translation } from "@/lib/translations";

interface PdfViewerProps {
    pdfUrl: string | null;
    t: Translation;
}

export default function PdfViewer({ pdfUrl, t }: PdfViewerProps) {
    return (
        <div className="bg-[#FDFFFF] border border-[#D2B68A]/40 rounded-2xl shadow-xl h-[calc(100vh-8rem)] flex flex-col sticky top-24 overflow-hidden">
            {/* HEADER*/}
            <div className="px-5 py-3 border-b border-[#D2B68A]/30 flex justify-between items-center bg-[#D2B68A]/50">
                <span className="text-xs font-bold text-[#222D52] uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#222D52]" />
                    {t.originalDoc}
                </span>

                {pdfUrl && (
                    <span className="text-[10px] font-bold bg-[#222D52] text-[#D2B68A] px-2 py-0.5 rounded shadow-sm">
                        {t.preview}
                    </span>
                )}
            </div>

            {/* PDF VIEWER */}
            <div className="flex-1 bg-[#FDFFFF] relative group">
                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0`}
                        className="w-full h-full"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-60">
                        <div className="w-24 h-32 border-2 border-dashed border-[#D2B68A]/50 rounded-lg flex items-center justify-center mb-4 bg-[#FDFFFF]">
                            <FileText className="w-8 h-8 text-[#222D52]/40" />
                        </div>
                        <p className="text-sm font-medium text-[#222D52]/60 font-serif italic">
                            {t.noFile}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
