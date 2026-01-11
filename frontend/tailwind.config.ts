import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Tu paleta "Legal Luxury"
                legal: {
                    bg: "#020617", // slate-950
                    surface: "#0f172a", // slate-900
                    border: "#1e293b", // slate-800
                    text: "#e2e8f0", // slate-200
                    muted: "#64748b", // slate-500
                },
                primary: {
                    DEFAULT: "#f59e0b", // amber-500
                    hover: "#d97706", // amber-600
                    light: "rgba(245, 158, 11, 0.1)",
                },
                risk: {
                    high: "#ef4444", // red-500
                    safe: "#22c55e", // green-500
                },
            },
            fontFamily: {
                serif: ["var(--font-serif)", "serif"],
            },
        },
    },
    plugins: [],
};
export default config;
