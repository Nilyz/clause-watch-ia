import { Scale, Globe, Mail } from "lucide-react";
import { Translation, Language } from "@/lib/translations";

interface HeaderProps {
    t: Translation;
    lang: Language;
    toggleLang: () => void;
}

export default function Header({ t, lang, toggleLang }: HeaderProps) {
    return (
        <header className="bg-[#222D52] border-b border-[#D2B68A]/30 sticky top-0 z-50 shadow-md">
            <div className="container mx-auto px-6 py-5 flex justify-between items-center">
                {/* --- LOGO --- */}
                <div className="flex items-center gap-3">
                    <Scale
                        className="text-[#D2B68A] w-7 h-7"
                        strokeWidth={1.5}
                    />

                    <h1 className="text-xl font-sans font-bold tracking-wide text-[#FDFFFF]">
                        ClauseWatch{" "}
                        <span className="text-[#D2B68A] ml-1 font-serif ">
                            {t.titleSub}
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* LANGUAGE */}
                    <button
                        onClick={toggleLang}
                        className="flex items-center gap-2 text-xs font-bold text-[#EEE5D9]/70 hover:text-[#D2B68A] transition-colors uppercase tracking-widest"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{lang.toUpperCase()}</span>
                    </button>

                    {/* SEPARATOR */}
                    <div className="h-4 w-px bg-[#D2B68A]/30"></div>

                    <a
                        href="mailto:yilin.zh135@gmail.com"
                        className="
                            text-xs font-semibold uppercase tracking-widest 
                            border border-[#D2B68A] text-[#D2B68A] 
                            px-5 py-2 rounded 
                            hover:bg-[#D2B68A] hover:text-[#222D52] 
                            transition-all duration-300 flex items-center gap-2 cursor-pointer"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        {t.contact}
                    </a>
                </div>
            </div>
        </header>
    );
}
