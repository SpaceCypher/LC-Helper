import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateNextReview, findNextAvailableSlot, type RevisionOutcome } from '@/lib/revision';

/**
 * POST /api/revisions
 * Update revision state after user completes a revision
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, outcome, confidenceScore } = body;

        if (!slug || !outcome) {
            return NextResponse.json(
                { error: 'Missing required fields: slug and outcome' },
                { status: 400 }
            );
        }

        // Validate outcome
        const validOutcomes: RevisionOutcome[] = ['SUCCESS', 'PARTIAL', 'FAIL'];
        if (!validOutcomes.includes(outcome as RevisionOutcome)) {
            return NextResponse.json(
                { error: 'Invalid outcome. Must be SUCCESS, PARTIAL, or FAIL' },
                { status: 400 }
            );
        }

        // Find problem
        const problem = await prisma.problem.findUnique({
            where: { slug },
            include: { revision: true },
        });

        if (!problem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        if (!problem.revision) {
            return NextResponse.json(
                { error: 'Revision state not found' },
                { status: 404 }
            );
        }

        // Calculate next review date and count
        const { nextReview, revisionCount } = calculateNextReview(
            outcome as RevisionOutcome,
            problem.revision.revisionCount
        );

        // Apply daily cap: find next available slot with <3 problems
        const cappedNextReview = await findNextAvailableSlot(nextReview, prisma);

        // Update revision state
        const updated = await prisma.revision.update({
            where: { problemId: problem.id },
            data: {
                lastReviewed: new Date(),
                nextReview: cappedNextReview,
                revisionCount,
                totalReviews: problem.revision.totalReviews + 1, // Always increment
                confidenceScore: confidenceScore || problem.revision.confidenceScore,
            },
        });

        return NextResponse.json({
            success: true,
            revision: updated,
        });
    } catch (error) {
        console.error('Revision update error:', error);
        return NextResponse.json(
            { error: 'Failed to update revision' },
            { status: 500 }
        );
    }
}
