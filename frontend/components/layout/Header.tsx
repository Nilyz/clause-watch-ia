import { Scale, Globe, Mail } from "lucide-react";
import { Translation, Language } from "@/lib/translations";

interface HeaderProps {
    t: Translation;
    lang: Language;
    toggleLang: () => void;
}

export default function Header({ t, lang, toggleLang }: HeaderProps) {
    return (
        <header className="border-b border-legal-border bg-legal-surface/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Scale className="text-primary w-6 h-6" />
                    <h1 className="text-xl font-serif font-bold tracking-wide text-legal-text">
                        ClauseWatch{" "}
                        <span className="text-primary">{t.titleSub}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLang}
                        className="flex items-center gap-2 text-xs font-bold text-legal-muted hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{lang.toUpperCase()}</span>
                    </button>
                    <button className="text-xs uppercase tracking-widest border border-legal-muted px-4 py-2 rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {t.contact}
                    </button>
                </div>
            </div>
        </header>
    );
}
