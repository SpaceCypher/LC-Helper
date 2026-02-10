'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CodeViewer from '@/components/CodeViewer';
import NotesEditor from '@/components/NotesEditor';
import RevisionControls from '@/components/RevisionControls';

interface ProblemData {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    problemNumber?: number;
    description?: string;
    constraints?: string;
    examples?: string;
    solution?: {
        code: string;
        language: string;
    };
    explanation?: {
        approachTag: string;
        coreIdea: string;
        explanationSteps: string;
        complexity: string;
        keyInsight: string;
        commonPitfall: string;
        difficultyRating: string;
        roast: string | null;
    };
    notes: Array<{
        id: string;
        type: string;
        content: string;
    }>;
}

export default function RevisionPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const [problem, setProblem] = useState<ProblemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProblem();
    }, [slug]);

    const fetchProblem = async () => {
        try {
            // Fetch problem with all relations
            const response = await fetch(`/api/problems?search=${slug}&limit=1`);
            const data = await response.json();

            if (data.problems && data.problems.length > 0) {
                const problemData = data.problems[0];

                // Fetch notes separately
                const notesResponse = await fetch(`/api/notes?slug=${slug}`);
                const notesData = await notesResponse.json();

                setProblem({
                    ...problemData,
                    notes: notesData.notes || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch problem:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReveal = () => {
        setRevealed(true);
    };

    const handleGenerateAI = async () => {
        if (!problem) return;

        setGeneratingAI(true);
        try {
            const response = await fetch('/api/ai/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate explanation');
            }

            // Refresh problem data to get the new explanation
            await fetchProblem();
        } catch (error) {
            console.error('Error generating AI explanation:', error);
            alert('Failed to generate AI explanation. Please try again.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleRevisionComplete = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="breathing-space">
                <div className="glass-card p-8 text-center animate-pulse">
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="breathing-space">
                <div className="glass-card p-12 text-center">
                    <p className="text-xl text-text-secondary mb-4">Problem not found</p>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const recallNotes = problem.notes.filter((n) => n.type === 'RECALL');

    let explanationData = null;
    if (problem.explanation) {
        try {
            explanationData = {
                ...problem.explanation,
                explanationSteps: JSON.parse(problem.explanation.explanationSteps),
                complexity: JSON.parse(problem.explanation.complexity),
            };
        } catch (e) {
            console.error('Failed to parse explanation data:', e);
        }
    }

    return (
        <div className="breathing-space">
            {/* Problem Header - Always Visible */}
            <div className="glass-card p-8 mb-8 animate-fade-in">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        {problem.problemNumber && (
                            <span className="text-sm text-text-muted mb-2 block">
                                Problem #{problem.problemNumber}
                            </span>
                        )}
                        <h1>{problem.title}</h1>
                    </div>
                    <span
                        className={`text-sm font-medium ${problem.difficulty === 'Easy'
                            ? 'text-green-400'
                            : problem.difficulty === 'Medium'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
                    >
                        {problem.difficulty}
                    </span>
                </div>

                {/* Problem Description */}
                {problem.description && (
                    <div className="mb-4">
                        <h3 className="text-sm text-text-muted mb-2">Description</h3>
                        <p className="text-text-secondary leading-relaxed">
                            {problem.description}
                        </p>
                    </div>
                )}

                {/* Examples */}
                {problem.examples && (
                    <div className="mb-4">
                        <h3 className="text-sm text-text-muted mb-2">Examples</h3>
                        <pre className="text-text-secondary bg-black/20 p-4 rounded-lg overflow-x-auto text-sm">
                            {problem.examples}
                        </pre>
                    </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                    <div>
                        <h3 className="text-sm text-text-muted mb-2">Constraints</h3>
                        <pre className="text-text-secondary text-sm whitespace-pre-wrap">
                            {problem.constraints}
                        </pre>
                    </div>
                )}
            </div>

            {/* Recall Notes - Always Visible */}
            {recallNotes.length > 0 && (
                <div className="glass-card p-6 mb-8 animate-slide-up">
                    <h3 className="text-lg font-medium mb-4">Recall Notes</h3>
                    <div className="space-y-2">
                        {recallNotes.map((note) => (
                            <p key={note.id} className="text-text-secondary">
                                • {note.content}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Reveal Button - Hidden after reveal */}
            {!revealed ? (
                <div className="glass-card p-12 text-center animate-slide-up">
                    <p className="text-xl text-text-secondary mb-6">
                        Try to recall the solution, approach, and key insights
                    </p>
                    <button onClick={handleReveal} className="btn-primary text-lg px-8 py-4">
                        I Tried → Show Solution
                    </button>
                </div>
            ) : (
                <div className="vertical-flow">
                    {/* Code Viewer */}
                    {problem.solution && (
                        <CodeViewer
                            code={problem.solution.code}
                            language={problem.solution.language}
                        />
                    )}

                    {/* AI Explanation Button - Show only if no explanation exists */}
                    {problem.solution && !explanationData && (
                        <div className="glass-card p-6 text-center animate-fade-in">
                            <p className="text-text-secondary mb-4">
                                Get AI-powered explanation of your solution approach
                            </p>
                            <button
                                onClick={handleGenerateAI}
                                disabled={generatingAI}
                                className="btn-primary px-6 py-3"
                            >
                                {generatingAI ? (
                                    <>
                                        <span className="animate-pulse">🤖 Generating...</span>
                                    </>
                                ) : (
                                    <>🤖 Generate AI Explanation</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* AI Explanation */}
                    {explanationData && (
                        <div className="glass-card p-8 animate-fade-in">
                            <h2 className="mb-6">AI Explanation</h2>

                            <div className="space-y-6">
                                {/* Approach Tag */}
                                <div>
                                    <span className="text-sm text-text-muted">Approach</span>
                                    <p className="text-lg font-medium text-accent mt-1">
                                        {explanationData.approachTag}
                                    </p>
                                </div>

                                {/* Core Idea */}
                                <div>
                                    <span className="text-sm text-text-muted">Core Idea</span>
                                    <p className="text-text-secondary mt-1">{explanationData.coreIdea}</p>
                                </div>

                                {/* Steps */}
                                <div>
                                    <span className="text-sm text-text-muted">Steps</span>
                                    <ol className="mt-2 space-y-2 list-decimal list-inside">
                                        {explanationData.explanationSteps.map((step: string, idx: number) => (
                                            <li key={idx} className="text-text-secondary">
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Complexity */}
                                <div className="flex gap-8">
                                    <div>
                                        <span className="text-sm text-text-muted">Time Complexity</span>
                                        <p className="text-accent font-mono mt-1">
                                            {explanationData.complexity.time}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-text-muted">Space Complexity</span>
                                        <p className="text-accent font-mono mt-1">
                                            {explanationData.complexity.space}
                                        </p>
                                    </div>
                                </div>

                                {/* Key Insight */}
                                <div className="glass-card p-4 bg-accent/5 border-accent">
                                    <span className="text-sm text-accent">Key Insight</span>
                                    <p className="text-text-secondary mt-1">{explanationData.keyInsight}</p>
                                </div>

                                {/* Common Pitfall */}
                                <div className="glass-card p-4 bg-red-400/5 border-red-400/30">
                                    <span className="text-sm text-red-400">Common Pitfall</span>
                                    <p className="text-text-secondary mt-1">{explanationData.commonPitfall}</p>
                                </div>

                                {/* Roast (if exists) */}
                                {explanationData.roast && (
                                    <div className="glass-card p-4 bg-yellow-400/5 border-yellow-400/30">
                                        <span className="text-sm text-yellow-400">💭 Roast</span>
                                        <p className="text-text-secondary mt-1 italic">{explanationData.roast}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes Editor */}
                    <NotesEditor
                        slug={slug}
                        notes={problem.notes}
                        onNotesChange={fetchProblem}
                    />

                    {/* Revision Controls */}
                    <RevisionControls
                        slug={slug}
                        onComplete={handleRevisionComplete}
                    />
                </div>
            )}
        </div>
    );
}
