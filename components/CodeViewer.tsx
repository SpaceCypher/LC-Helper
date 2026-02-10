'use client';

import Editor from '@monaco-editor/react';

interface CodeViewerProps {
    code: string;
    language: string;
}

export default function CodeViewer({ code, language }: CodeViewerProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Your Solution</h3>
                <button
                    onClick={handleCopy}
                    className="btn-secondary text-sm px-4 py-2"
                >
                    Copy Code
                </button>
            </div>

            <div className="rounded-glass overflow-hidden border border-glass-border">
                <Editor
                    height="400px"
                    language={language.toLowerCase()}
                    value={code}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        lineNumbers: 'on',
                        renderLineHighlight: 'none',
                        scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto',
                        },
                    }}
                />
            </div>
        </div>
    );
}
