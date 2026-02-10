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
        });
    };

    return (
        <div
            className="glass-card-hover p-6 animate-slide-up"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-medium pr-4">{title}</h3>
                <span className={`text-sm font-medium ${difficultyColor}`}>
                    {difficulty}
                </span>
            </div>

            <div className="flex items-center justify-between text-text-secondary text-sm">
                <div className="flex items-center gap-4">
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
