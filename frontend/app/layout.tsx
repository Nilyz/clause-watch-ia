import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ClauseWatch AI - Analizador de Contratos Laborales",
    description:
        "Detecta cláusulas abusivas en contratos españoles usando IA híbrida y privacidad total.",


    icons: {
        icon: "/clausewatch_logo.png",
        shortcut: "/clausewatch_logo.png",
        apple: "/clausewatch_logo.png", 
    },

    openGraph: {
        title: "ClauseWatch AI - Analizador Legal Inteligente",
        description:
            "Analiza tu contrato laboral en segundos. Privacidad 100% y detección de cláusulas nulas.",
        url: "https://clause-watch-ia.vercel.app",
        siteName: "ClauseWatch AI",
        images: [
            {
                url: "/preview_clausewatch.png", 
                width: 1200,
                height: 630,
                alt: "ClauseWatch AI Dashboard Preview",
            },
        ],
        locale: "es_ES",
        type: "website",
    },
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
