'use client';

import { useRouter } from 'next/navigation';

interface Problem {
    slug: string;
    title: string;
    difficulty: string;
}

interface Revision {
    nextReview: Date;
    problem: Problem;
}

interface UpcomingTasksListProps {
    revisions: Revision[];
    limit?: number; // Number of days to show
}

export default function UpcomingTasksList({ revisions, limit = 30 }: UpcomingTasksListProps) {
    const router = useRouter();

    // Group revisions by UTC Date string (YYYY-MM-DD)
    const revisionsByDate = revisions.reduce((acc, revision) => {
        // Use standard UTC date string for grouping
        const dateKey = new Date(revision.nextReview).toISOString().split('T')[0];

        if (!acc[dateKey]) {
            acc[dateKey] = {
                dateKey,
                problems: [],
            };
        }
        acc[dateKey].problems.push(revision.problem);
        return acc;
    }, {} as Record<string, { dateKey: string; problems: Problem[] }>);

    // Sort by date key (ascending) and limit
    const sortedDates = Object.values(revisionsByDate)
        .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
        .slice(0, limit);

    // Get relative time string comparing UTC dates
    const getRelativeTime = (dateKey: string): string => {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];

        // Compare date strings directly or timestamp of YYYY-MM-DD
        const target = new Date(dateKey); // Parsed as UTC midnight
        const now = new Date(todayKey);   // Parsed as UTC midnight

        const diffTime = target.getTime() - now.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        if (diffDays < 7) return `in ${diffDays} days`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
        }
        const months = Math.floor(diffDays / 30);
        return `in ${months} ${months === 1 ? 'month' : 'months'}`;
    };

    const isPast = (dateKey: string): boolean => {
        const today = new Date().toISOString().split('T')[0];
        return dateKey < today;
    };

    if (sortedDates.length === 0) {
        return (
            <div className="glass-card p-6 animate-fade-in">
                <h2 className="text-2xl font-light mb-6">📋 Upcoming Reviews</h2>
                <p className="text-text-muted text-center py-8">
                    No upcoming reviews scheduled
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-fade-in">
            <h2 className="text-2xl font-light mb-6">📋 Upcoming Reviews</h2>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {sortedDates.map(({ dateKey, problems }) => {
                    const relativeTime = getRelativeTime(dateKey);
                    const isOverdue = isPast(dateKey);

                    // Create date object for display, forcing UTC interpreting
                    const displayDate = new Date(dateKey);

                    return (
                        <div key={dateKey} className="animate-slide-up">
                            {/* Date Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className={`font-medium ${isOverdue ? 'text-red-400' : 'text-accent'
                                        }`}>
                                        {displayDate.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            timeZone: 'UTC' // Important: Force UTC display
                                        })}
                                    </h3>
                                    <p className="text-xs text-text-muted">{relativeTime}</p>
                                </div>
                                <span className="text-sm text-text-muted">
                                    {problems.length} {problems.length === 1 ? 'problem' : 'problems'}
                                </span>
                            </div>

                            {/* Problems List */}
                            <div className="space-y-2 ml-4 pl-4 border-l-2 border-glass-border">
                                {problems.map(problem => (
                                    <button
                                        key={problem.slug}
                                        onClick={() => router.push(`/problems/${problem.slug}`)}
                                        className="w-full group"
                                    >
                                        <div className="flex items-start justify-between p-2 rounded-glass hover:bg-glass-light transition-all duration-200">
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium group-hover:text-accent transition-colors">
                                                    {problem.title}
                                                </p>
                                            </div>
                                            <span className={`text-xs ml-2 ${problem.difficulty === 'Easy' ? 'text-green-400' :
                                                problem.difficulty === 'Medium' ? 'text-yellow-400' :
                                                    'text-red-400'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More Indicator */}
            {revisions.length > limit * 3 && (
                <div className="mt-6 pt-4 border-t border-glass-border text-center">
                    <p className="text-sm text-text-muted">
                        Showing next {sortedDates.length} days • {revisions.length} total problems
                    </p>
                </div>
            )}
        </div>
    );
}
