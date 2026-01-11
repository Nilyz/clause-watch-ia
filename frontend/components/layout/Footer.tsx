import { Github, Linkedin, Code, Heart, Scale } from "lucide-react";
import { Translation } from "@/lib/translations";

interface FooterProps {
    t: Translation;
}

export default function Footer({ t }: FooterProps) {
    return (
        <footer className="border-t border-legal-border bg-legal-surface py-8 mt-12">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Copyright & Logo */}
                <div className="text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                        <Scale className="w-5 h-5 text-primary" />
                        <span className="font-serif font-bold text-legal-text">
                            ClauseWatch AI
                        </span>
                    </div>
                    <p className="text-xs text-legal-muted">
                        &copy; {new Date().getFullYear()} ClauseWatch.{" "}
                        {t.footerRights}
                    </p>
                </div>

                {/* Social Icons - ¡CAMBIA LOS LINKS! */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://github.com/tu-usuario"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-legal-muted hover:text-legal-text transition-colors"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                    <a
                        href="https://linkedin.com/in/tu-usuario"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-legal-muted hover:text-legal-text transition-colors"
                    >
                        <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                        href="https://github.com/tu-usuario/clause-watch"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-legal-muted hover:text-legal-text transition-colors flex items-center gap-2 text-xs border border-legal-border px-3 py-1 rounded-full hover:border-primary"
                    >
                        <Code className="w-4 h-4" /> <span>{t.footerRepo}</span>
                    </a>
                </div>

                {/* Made with Love */}
                <div className="text-xs text-legal-muted flex items-center gap-1">
                    {t.footerBuilt}{" "}
                    <span className="text-primary font-bold">Nilyzz</span>
                    <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                </div>
            </div>
        </footer>
    );
}
