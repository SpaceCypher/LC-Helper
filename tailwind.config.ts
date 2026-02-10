import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: '#0e1116',
                    secondary: '#0b0f14',
                },
                glass: {
                    border: 'rgba(255, 255, 255, 0.08)',
                    surface: 'rgba(255, 255, 255, 0.06)',
                },
                accent: {
                    DEFAULT: '#60a5fa', // muted cyan/blue
                    hover: '#93c5fd',
                },
                text: {
                    primary: '#e5e7eb',
                    secondary: '#9ca3af',
                    muted: '#6b7280',
                },
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'glass': '16px',
            },
            backdropBlur: {
                'glass': '12px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glass-hover': '0 12px 40px 0 rgba(96, 165, 250, 0.15)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'glow': 'glow 0.2s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 0 rgba(96, 165, 250, 0)' },
                    '50%': { boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
