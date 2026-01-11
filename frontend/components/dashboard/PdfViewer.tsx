import { FileText } from "lucide-react";
import { Translation } from "@/lib/translations";

interface PdfViewerProps {
    pdfUrl: string | null;
    t: Translation;
}

export default function PdfViewer({ pdfUrl, t }: PdfViewerProps) {
    return (
        <div className="bg-legal-surface border border-legal-border rounded-2xl p-1 shadow-2xl h-[calc(100vh-8rem)] flex flex-col sticky top-24">
            <div className="px-4 py-2 border-b border-legal-border flex justify-between items-center bg-legal-surface rounded-t-xl">
                <span className="text-xs font-bold text-legal-muted uppercase tracking-widest">
                    {t.originalDoc}
                </span>
                {pdfUrl && (
                    <span className="text-[10px] text-primary bg-primary-light px-2 py-0.5 rounded">
                        {t.preview}
                    </span>
                )}
            </div>

            <div className="flex-1 bg-legal-bg relative rounded-b-xl overflow-hidden group">
                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0`}
                        className="w-full h-full"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-legal-muted opacity-50">
                        <div className="w-24 h-32 border-2 border-dashed border-legal-border rounded flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">{t.noFile}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
