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
    const [allProblems, setAllProblems] = useState<Problem[]>([]);
    const [visibleProblems, setVisibleProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        fetchAllProblems();
    }, []);

    useEffect(() => {
        let result = allProblems;

        // 1. Filter by Difficulty
        if (filter !== 'all') {
            result = result.filter(p => p.difficulty === filter);
        }

        // 2. Filter by Search (Live)
        if (search.trim()) {
            const query = search.toLowerCase().trim();
            result = result.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.slug.toLowerCase().includes(query)
            );
        }

        setVisibleProblems(result);
    }, [search, filter, allProblems]);

    const fetchAllProblems = async () => {
        setLoading(true);
        try {
            // Fetch ALL problems for client-side filtering
            const response = await fetch(`/api/problems?limit=1000`);
            const data = await response.json();
            const problems = data.problems || [];
            setAllProblems(problems);
            setVisibleProblems(problems);
        } catch (error) {
            console.error('Failed to fetch problems:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="breathing-space">
            <div className="mb-8 animate-fade-in">
                <h1 className="mb-2">All Problems</h1>
                <p className="text-text-secondary">
                    {visibleProblems.length} {visibleProblems.length === 1 ? 'problem' : 'problems'} found
                </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up">
                {/* Search Bar */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-full input-glass px-4 py-3"
                    />
                </div>

                {/* Difficulty Filter */}
                <div className="glass-card p-2 flex gap-2 overflow-x-auto">
                    {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setFilter(diff)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${filter === diff
                                ? 'bg-accent text-white'
                                : 'bg-transparent text-text-secondary hover:text-accent'
                                }`}
                        >
                            {diff === 'all' ? 'All' : diff}
                        </button>
                    ))}
                </div>
            </div>

            {visibleProblems.length === 0 ? (
                <div className="glass-card p-12 text-center animate-slide-up">
                    <p className="text-xl text-text-secondary mb-4">
                        No problems found
                    </p>
                    <p className="text-text-muted">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <div className="vertical-flow">
                    {visibleProblems.map((problem, index) => (
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
