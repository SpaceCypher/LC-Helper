'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProblemCard from '@/components/ProblemCard';

interface Problem {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    revision?: {
        nextReview: string;
        totalReviews: number;
    };
}

export default function ProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const router = useRouter();

    useEffect(() => {
        fetchProblems();
    }, [filter]);

    const fetchProblems = async () => {
        try {
            const query = filter === 'all' ? '' : `?difficulty=${filter}`;
            const response = await fetch(`/api/problems${query}`);
            const data = await response.json();
            setProblems(data.problems || []);
        } catch (error) {
            console.error('Failed to fetch problems:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="breathing-space">
                <div className="glass-card p-8 text-center animate-pulse">
                    <p className="text-text-secondary">Loading problems...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="breathing-space">
            <div className="mb-8 animate-fade-in">
                <h1 className="mb-2">All Problems</h1>
                <p className="text-text-secondary">
                    {problems.length} {problems.length === 1 ? 'problem' : 'problems'} in your revision system
                </p>
            </div>

            {/* Difficulty Filter */}
            <div className="glass-card p-4 mb-6 flex gap-4 animate-slide-up">
                {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setFilter(diff)}
                        className={`px-4 py-2 rounded-full transition-all duration-200 ${filter === diff
                            ? 'bg-accent text-white'
                            : 'bg-transparent text-text-secondary hover:text-accent'
                            }`}
                    >
                        {diff === 'all' ? 'All' : diff}
                    </button>
                ))}
            </div>

            {problems.length === 0 ? (
                <div className="glass-card p-12 text-center animate-slide-up">
                    <p className="text-xl text-text-secondary mb-4">
                        No problems found
                    </p>
                    <p className="text-text-muted">
                        Start solving problems on LeetCode with the browser extension installed
                    </p>
                </div>
            ) : (
                <div className="vertical-flow">
                    {problems.map((problem, index) => (
                        <div
                            key={problem.id}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <ProblemCard
                                title={problem.title}
                                slug={problem.slug}
                                difficulty={problem.difficulty}
                                nextReview={problem.revision?.nextReview}
                                totalReviews={problem.revision?.totalReviews}
                                onClick={() => router.push(`/problems/${problem.slug}`)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
