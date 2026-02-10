/**
 * Spaced Repetition Logic for LC Helper
 * Based on fixed intervals: [2, 3, 7, 21, 60] days (with daily cap of 3 problems)
 */

import { PrismaClient } from '@prisma/client';

// Fixed revision intervals in days (changed from [1, 3, 7...] to [2, 3, 7...])
const REVISION_INTERVALS = [2, 3, 7, 21, 60];

// Daily review limit
export const DAILY_REVIEW_LIMIT = 3;

export type RevisionOutcome = 'SUCCESS' | 'PARTIAL' | 'FAIL';

/**
 * Find the next available date that has fewer than DAILY_REVIEW_LIMIT problems scheduled
 * @param baseDate - Starting date to check from
 * @param prisma - Prisma client instance
 * @param dailyLimit - Maximum problems per day (default: 3)
 * @returns Next available date with capacity
 */
export async function findNextAvailableSlot(
    baseDate: Date,
    prisma: PrismaClient,
    dailyLimit: number = DAILY_REVIEW_LIMIT
): Promise<Date> {
    const checkDate = new Date(baseDate);
    checkDate.setHours(0, 0, 0, 0);

    // Check up to 100 days in the future (safety limit)
    for (let i = 0; i < 100; i++) {
        const dayStart = new Date(checkDate);
        const dayEnd = new Date(checkDate);
        dayEnd.setDate(dayEnd.getDate() + 1);

        // Count how many problems are scheduled for this day
        const count = await prisma.revision.count({
            where: {
                nextReview: {
                    gte: dayStart,
                    lt: dayEnd,
                },
            },
        });

        // If this day has capacity, use it
        if (count < dailyLimit) {
            return checkDate;
        }

        // Otherwise, try next day
        checkDate.setDate(checkDate.getDate() + 1);
    }

    // Fallback: if all days are full, return baseDate anyway
    return baseDate;
}

/**
 * Calculate the next review date based on revision outcome
 * @param outcome - SUCCESS, PARTIAL, or FAIL
 * @param currentCount - Current revision count
 * @returns Object with nextReview date and updated revisionCount
 */
export function calculateNextReview(
    outcome: RevisionOutcome,
    currentCount: number
): { nextReview: Date; revisionCount: number } {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    let newCount = currentCount;
    let intervalDays: number;

    switch (outcome) {
        case 'SUCCESS':
            // Advance to next interval
            newCount = currentCount + 1;
            intervalDays = getIntervalForCount(newCount);
            break;

        case 'PARTIAL':
            // Repeat same interval
            newCount = currentCount;
            intervalDays = getIntervalForCount(newCount);
            break;

        case 'FAIL':
            // Reset to day 3 (gentle reset, not day 2)
            newCount = 1;
            intervalDays = REVISION_INTERVALS[1]; // 3 days
            break;

        default:
            throw new Error(`Invalid revision outcome: ${outcome}`);
    }

    const nextReview = new Date(today);
    nextReview.setDate(nextReview.getDate() + intervalDays);

    return { nextReview, revisionCount: newCount };
}

/**
 * Get interval days for a given revision count
 * Returns the last interval if count exceeds array length
 */
function getIntervalForCount(count: number): number {
    if (count >= REVISION_INTERVALS.length) {
        return REVISION_INTERVALS[REVISION_INTERVALS.length - 1];
    }
    return REVISION_INTERVALS[count];
}

/**
 * Initialize revision state for a new problem
 * Note: This returns the base date WITHOUT daily cap applied
 * The caller should use findNextAvailableSlot() to apply the cap
 * @returns Initial revision object
 */
export function initializeRevision(): {
    nextReview: Date;
    revisionCount: number;
    lastReviewed: null;
} {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextReview = new Date(today);
    nextReview.setDate(nextReview.getDate() + REVISION_INTERVALS[0]); // 2 days

    return {
        nextReview,
        revisionCount: 0,
        lastReviewed: null,
    };
}

/**
 * Check if a problem is due for revision
 * @param nextReview - Next review date from database
 * @returns true if due today or earlier
 */
export function isDueForRevision(nextReview: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviewDate = new Date(nextReview);
    reviewDate.setHours(0, 0, 0, 0);

    return reviewDate <= today;
}

/**
 * Get interval information for display purposes
 */
export function getIntervalInfo() {
    return {
        intervals: REVISION_INTERVALS,
        maxInterval: REVISION_INTERVALS[REVISION_INTERVALS.length - 1],
    };
}
