'use client';

interface ProblemCardProps {
    title: string;
    slug: string;
    difficulty: string;
    nextReview?: Date | string;
    totalReviews?: number;
    onClick?: () => void;
}

export default function ProblemCard({
    title,
    slug,
    difficulty,
    nextReview,
    totalReviews = 0,
    onClick,
}: ProblemCardProps) {
    const difficultyColors = {
        Easy: 'text-green-400',
        Medium: 'text-yellow-400',
        Hard: 'text-red-400',
    };

    const difficultyColor =
        difficultyColors[difficulty as keyof typeof difficultyColors] || 'text-text-secondary';

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'Not scheduled';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC', // Ensure consistency with server-side UTC logic
        });
    };

    return (
        <div
            className="glass-card-hover p-5 md:p-6 animate-slide-up"
            onClick={onClick}
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                <h3 className="text-lg md:text-xl font-medium pr-4 break-words">{title}</h3>
                <span className={`text-sm font-medium ${difficultyColor} self-start sm:self-auto`}>
                    {difficulty}
                </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-text-secondary text-sm gap-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Next review: {formatDate(nextReview)}</span>
                    {totalReviews > 0 && (
                        <span className="text-accent">
                            ✓ {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
