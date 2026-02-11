import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isDueForRevision } from '@/lib/revision';

export const dynamic = 'force-dynamic';

/**
 * GET /api/problems
 * Query problems with various filters
 * 
 * Query params:
 * - due=true: Get only problems due for revision
 * - limit=5: Limit results
 * - difficulty=Medium: Filter by difficulty
 * - search=binary: Search by title
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dueOnly = searchParams.get('due') === 'true';
        const limit = parseInt(searchParams.get('limit') || '100');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');

        let problems;

        if (dueOnly) {
            // Get all problems and filter by due date
            const allProblems = await prisma.problem.findMany({
                include: {
                    revision: true,
                    solution: true,
                    explanation: true,
                },
                orderBy: {
                    revision: {
                        nextReview: 'asc',
                    },
                },
            });

            // Filter to only due problems
            problems = allProblems.filter((p: typeof allProblems[number]) => {
                if (!p.revision) return false;
                return isDueForRevision(p.revision.nextReview);
            });

            // Apply limit
            problems = problems.slice(0, limit);
        } else {
            // Build where clause
            const where: any = {};

            if (difficulty) {
                where.difficulty = difficulty;
            }

            if (search) {
                where.OR = [
                    { title: { contains: search } },
                    { slug: { contains: search } },
                ];
            }

            problems = await prisma.problem.findMany({
                where,
                include: {
                    revision: true,
                    solution: true,
                    explanation: true,
                },
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }

        return NextResponse.json({ problems });
    } catch (error) {
        console.error('Error fetching problems:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problems' },
            { status: 500 }
        );
    }
}
