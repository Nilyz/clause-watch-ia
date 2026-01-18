import { Github, Linkedin, Code } from "lucide-react"; // Scale quitado
import { Translation } from "@/lib/translations";
import Image from "next/image";

interface FooterProps {
    t: Translation;
}

export default function Footer({ t }: FooterProps) {
    return (
        <footer className="bg-[#EEE5D9] border-t border-[#D2B68A]/40 py-10 mt-16">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                {/* LOGO AREA */}
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-15">
                        <Image
                            src="/clausewatch_logo.png"
                            alt="ClauseWatch Logo"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>

                    <span className="font-serif font-bold text-lg text-[#222D52] tracking-wide">
                        ClauseWatch{" "}
                        <span className="text-[#b08d55] ml-1 font-serif ">
                            {t.titleSub}
                        </span>
                    </span>
                </div>

                {/* SOCIAL LINKS */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://github.com/Nilyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#222D52]/70 hover:text-[#D2B68A] transition-colors"
                    >
                        <Github className="w-6 h-6" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/yilinzzhou/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#222D52]/70 hover:text-[#D2B68A] transition-colors"
                    >
                        <Linkedin className="w-6 h-6" />
                    </a>

                    <a
                        href="https://github.com/Nilyz/clause-watch-ia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full transition-all
                            border border-[#222D52]/50 text-[#222D52]/70
                            hover:border-[#222D52] hover:bg-[#222D52] hover:text-[#D2B68A]
                        "
                    >
                        <Code className="w-5 h-5" />
                        <span>{t.footerRepo}</span>
                    </a>
                </div>

                {/* COPYRIGHT */}
                <div className="text-xs text-[#222D52]/60 flex items-center gap-1 font-medium tracking-wide">
                    &copy; {new Date().getFullYear()} ClauseWatch.{" "}
                    {t.footerBuilt}{" "}
                    <span className="text-[#b08d55] font-bold">Yilin Zhou</span>
                </div>
            </div>
        </footer>
    );
}
