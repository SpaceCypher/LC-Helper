'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProblemCard from '@/components/ProblemCard';
import RevisionCalendar from '@/components/RevisionCalendar';
import UpcomingTasksList from '@/components/UpcomingTasksList';

interface Problem {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    revision?: {
        nextReview: string;
        totalReviews: number;
        lastReviewed: string | null;
    };
}

interface RevisionData {
    nextReview: Date;
    lastReviewed: Date | null;
    problem: {
        slug: string;
        title: string;
        difficulty: string;
    };
}

export default function Dashboard() {
    const [dueProblems, setDueProblems] = useState<Problem[]>([]);
    const [allRevisions, setAllRevisions] = useState<RevisionData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch due problems
            const dueResponse = await fetch('/api/problems?due=true&limit=5');
            const dueData = await dueResponse.json();
            setDueProblems(dueData.problems || []);

            // Fetch all upcoming revisions for calendar
            const allResponse = await fetch('/api/problems');
            const allData = await allResponse.json();

            // Transform to revision data format
            const revisions: RevisionData[] = (allData.problems || [])
                .filter((p: Problem) => p.revision)
                .map((p: Problem) => ({
                    nextReview: new Date(p.revision!.nextReview),
                    lastReviewed: p.revision!.lastReviewed ? new Date(p.revision!.lastReviewed) : null,
                    problem: {
                        slug: p.slug,
                        title: p.title,
                        difficulty: p.difficulty,
                    },
                }));

            setAllRevisions(revisions);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="breathing-space">
            {/* Today's Revision Section */}
            <div className="mb-8 animate-fade-in">
                <h1 className="mb-2">Today's Revision</h1>
                <p className="text-text-secondary">
                    {dueProblems.length === 0
                        ? 'No problems due for revision today'
                        : `${dueProblems.length} ${dueProblems.length === 1 ? 'problem' : 'problems'} ready to review`}
                </p>
            </div>

            {dueProblems.length === 0 ? (
                <div className="glass-card p-12 text-center animate-slide-up mb-8">
                    <p className="text-xl text-text-secondary mb-4">
                        ✨ You're all caught up!
                    </p>
                    <p className="text-text-muted">
                        Check back tomorrow for more revisions, or{' '}
                        <a href="/problems" className="text-accent hover:underline">
                            browse all problems
                        </a>
                    </p>
                </div>
            ) : (
                <div className="vertical-flow mb-8">
                    {dueProblems.map((problem, index) => (
                        <div
                            key={problem.id}
                            style={{ animationDelay: `${index * 100}ms` }}
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

            {/* Calendar + Task List Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevisionCalendar revisions={allRevisions} />
                </div>
                <div className="lg:col-span-1">
                    <UpcomingTasksList revisions={allRevisions} limit={30} />
                </div>
            </div>
        </div>
    );
}
