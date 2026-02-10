'use client';

import { useState } from 'react';

interface RevisionControlsProps {
    slug: string;
    onComplete?: () => void;
}

export default function RevisionControls({ slug, onComplete }: RevisionControlsProps) {
    const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
    const [confidenceScore, setConfidenceScore] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedOutcome) return;

        setIsSubmitting(true);
        try {
            await fetch('/api/revisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    outcome: selectedOutcome,
                    confidenceScore,
                }),
            });

            onComplete?.();
        } catch (error) {
            console.error('Failed to submit revision:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-card p-8 animate-fade-in">
            <h3 className="text-2xl font-light mb-6">How did it go?</h3>

            {/* Outcome Selection */}
            <div className="space-y-4 mb-8">
                <button
                    onClick={() => setSelectedOutcome('SUCCESS')}
                    className={`w-full p-4 rounded-glass border-2 transition-all duration-200 text-left ${selectedOutcome === 'SUCCESS'
                            ? 'border-green-400 bg-green-400/10 shadow-glass-hover'
                            : 'border-glass-border hover:border-green-400/50'
                        }`}
                >
                    <span className="text-lg font-medium">✅ Success</span>
                    <p className="text-sm text-text-muted mt-1">
                        I recalled most of it correctly
                    </p>
                </button>

                <button
                    onClick={() => setSelectedOutcome('PARTIAL')}
                    className={`w-full p-4 rounded-glass border-2 transition-all duration-200 text-left ${selectedOutcome === 'PARTIAL'
                            ? 'border-yellow-400 bg-yellow-400/10 shadow-glass-hover'
                            : 'border-glass-border hover:border-yellow-400/50'
                        }`}
                >
                    <span className="text-lg font-medium">⚠️ Partial</span>
                    <p className="text-sm text-text-muted mt-1">
                        I remembered the idea, but missed details
                    </p>
                </button>

                <button
                    onClick={() => setSelectedOutcome('FAIL')}
                    className={`w-full p-4 rounded-glass border-2 transition-all duration-200 text-left ${selectedOutcome === 'FAIL'
                            ? 'border-red-400 bg-red-400/10 shadow-glass-hover'
                            : 'border-glass-border hover:border-red-400/50'
                        }`}
                >
                    <span className="text-lg font-medium">❌ Failed</span>
                    <p className="text-sm text-text-muted mt-1">
                        I blanked or misunderstood
                    </p>
                </button>
            </div>

            {/* Confidence Score */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-3">
                    Confidence Level (1-5)
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={confidenceScore}
                        onChange={(e) => setConfidenceScore(parseInt(e.target.value))}
                        className="flex-1"
                    />
                    <span className="text-2xl font-light w-8 text-center">
                        {confidenceScore}
                    </span>
                </div>
                <div className="flex justify-between text-xs text-text-muted mt-2">
                    <span>Not confident</span>
                    <span>Very confident</span>
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!selectedOutcome || isSubmitting}
                className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Complete Revision'}
            </button>
        </div>
    );
}
