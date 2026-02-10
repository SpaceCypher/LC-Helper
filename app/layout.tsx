import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "LC Helper - LeetCode Revision System",
    description: "Personal LeetCode revision system with spaced repetition and AI-powered explanations",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen">
                <nav className="glass-card mx-4 my-4 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <a href="/" className="text-2xl font-light tracking-tight hover:text-accent smooth-transition">
                            LC Helper
                        </a>
                        <div className="flex gap-6">
                            <a href="/" className="text-text-secondary hover:text-accent smooth-transition">
                                Dashboard
                            </a>
                            <a href="/problems" className="text-text-secondary hover:text-accent smooth-transition">
                                All Problems
                            </a>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 py-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
