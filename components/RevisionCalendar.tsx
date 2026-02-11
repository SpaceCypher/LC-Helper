'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Problem {
    slug: string;
    title: string;
    difficulty: string;
}

interface Revision {
    nextReview: Date;
    lastReviewed: Date | null;
    problem: Problem;
}

interface RevisionCalendarProps {
    revisions: Revision[];
}

export default function RevisionCalendar({ revisions }: RevisionCalendarProps) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Get revisions grouped by date (UTC YYYY-MM-DD)
    const revisionsByDate = revisions.reduce((acc, revision) => {
        const dateKey = new Date(revision.nextReview).toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(revision);
        return acc;
    }, {} as Record<string, Revision[]>);

    // Generate calendar grid for a month
    const generateCalendarDays = (month: Date) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();

        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);

        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];

        // Add empty slots for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days in month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, monthIndex, day));
        }

        return days;
    };

    // Helper to get YYYY-MM-DD key from local date object
    const getDateKey = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Determine date status
    const getDateStatus = (date: Date): 'empty' | 'scheduled' | 'due' | 'completed' | 'overdue' => {
        const dateKey = getDateKey(date);
        const dateRevisions = revisionsByDate[dateKey];

        if (!dateRevisions || dateRevisions.length === 0) {
            return 'empty';
        }

        // Use UTC comparison for status
        const todayKey = new Date().toISOString().split('T')[0];

        // Check if all problems for this date have been reviewed
        const allCompleted = dateRevisions.every(rev =>
            rev.lastReviewed && new Date(rev.lastReviewed) >= new Date(rev.nextReview)
        );

        if (allCompleted) {
            return 'completed';
        }

        if (dateKey < todayKey) {
            return 'overdue';
        }

        if (dateKey === todayKey) {
            return 'due';
        }

        return 'scheduled';
    };

    const getDateColor = (status: string): string => {
        switch (status) {
            case 'empty': return 'text-text-muted';
            case 'scheduled': return 'text-accent';
            case 'due': return 'text-yellow-400';
            case 'completed': return 'text-green-400';
            case 'overdue': return 'text-red-400';
            default: return 'text-text-secondary';
        }
    };

    const getDateBgColor = (status: string): string => {
        switch (status) {
            case 'scheduled': return 'bg-accent/10';
            case 'due': return 'bg-yellow-400/10';
            case 'completed': return 'bg-green-400/10';
            case 'overdue': return 'bg-red-400/10';
            default: return '';
        }
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleMonthChange = (offset: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + offset);
        setCurrentMonth(newMonth);
    };

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const calendarDays = generateCalendarDays(currentMonth);

    return (
        <div className="glass-card p-6 animate-fade-in">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light">📅 {monthName}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleMonthChange(-1)}
                        className="px-3 py-1 rounded-glass hover:bg-glass-light transition-colors"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1 rounded-glass hover:bg-glass-light transition-colors text-sm"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => handleMonthChange(1)}
                        className="px-3 py-1 rounded-glass hover:bg-glass-light transition-colors"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-text-muted py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dateKey = getDateKey(date);
                    const dateRevisions = revisionsByDate[dateKey];
                    const status = getDateStatus(date);
                    const problemCount = dateRevisions?.length || 0;
                    const isSelected = selectedDate ? getDateKey(selectedDate) === dateKey : false;

                    return (
                        <button
                            key={dateKey}
                            onClick={() => handleDateClick(date)}
                            className={`
                                aspect-square p-2 rounded-glass transition-all duration-200
                                ${getDateBgColor(status)}
                                ${isSelected ? 'ring-2 ring-accent shadow-glass-hover' : 'hover:shadow-glass-hover'}
                                flex flex-col items-center justify-center
                                relative
                            `}
                        >
                            <span className={`text-sm font-medium ${getDateColor(status)}`}>
                                {date.getDate()}
                            </span>
                            {problemCount > 0 && (
                                <span className={`text-xs mt-1 ${getDateColor(status)}`}>
                                    {problemCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Date Details */}
            {selectedDate && revisionsByDate[getDateKey(selectedDate)] && (
                <div className="mt-6 pt-6 border-t border-glass-border">
                    <h3 className="text-lg font-medium mb-4">
                        {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h3>
                    <div className="space-y-2">
                        {revisionsByDate[getDateKey(selectedDate)].map(revision => (
                            <button
                                key={revision.problem.slug}
                                onClick={() => router.push(`/problems/${revision.problem.slug}`)}
                                className="w-full p-3 rounded-glass border border-glass-border hover:border-accent/50 transition-colors text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{revision.problem.title}</span>
                                    <span className={`text-sm ${revision.problem.difficulty === 'Easy' ? 'text-green-400' :
                                        revision.problem.difficulty === 'Medium' ? 'text-yellow-400' :
                                            'text-red-400'
                                        }`}>
                                        {revision.problem.difficulty}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-glass-border">
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent/20 border-2 border-accent" />
                        <span className="text-text-muted">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400/20 border-2 border-yellow-400" />
                        <span className="text-text-muted">Due Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400/20 border-2 border-green-400" />
                        <span className="text-text-muted">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/20 border-2 border-red-400" />
                        <span className="text-text-muted">Overdue</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
