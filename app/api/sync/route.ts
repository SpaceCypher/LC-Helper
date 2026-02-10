import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { initializeRevision, findNextAvailableSlot } from '@/lib/revision';
import { generateExplanation } from '@/lib/gemini';

/**
 * POST /api/sync
 * Extension data ingestion endpoint
 * Receives problem data from browser extension and upserts to database
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, title, difficulty, code, language, submittedAt, problemNumber, description, constraints, examples } = body;

        // Validate required fields
        if (!slug || !title || !code || !language) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Upsert Problem (create if new, update metadata if exists)
        const problem = await prisma.problem.upsert({
            where: { slug },
            update: {
                title,
                difficulty: difficulty || 'Medium',
                ...(problemNumber !== undefined && { problemNumber }),
                ...(description !== undefined && { description }),
                ...(constraints !== undefined && { constraints }),
                ...(examples !== undefined && { examples }),
            },
            create: {
                slug,
                title,
                difficulty: difficulty || 'Medium',
                ...(problemNumber !== undefined && { problemNumber }),
                ...(description !== undefined && { description }),
                ...(constraints !== undefined && { constraints }),
                ...(examples !== undefined && { examples }),
            },
        });

        // Upsert Solution (always replace with latest)
        await prisma.solution.upsert({
            where: { problemId: problem.id },
            update: {
                code,
                language,
                submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
            },
            create: {
                problemId: problem.id,
                code,
                language,
                submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
            },
        });

        // Initialize Revision state if new problem
        const existingRevision = await prisma.revision.findUnique({
            where: { problemId: problem.id },
        });

        if (!existingRevision) {
            const { nextReview, revisionCount } = initializeRevision();
            // Apply daily cap: find next available slot with <3 problems
            const cappedNextReview = await findNextAvailableSlot(nextReview, prisma);

            await prisma.revision.create({
                data: {
                    problemId: problem.id,
                    nextReview: cappedNextReview,
                    revisionCount,
                },
            });
        }

        // Trigger AI explanation generation (async, don't block response)
        // Check if explanation already exists
        const existingExplanation = await prisma.aIExplanation.findUnique({
            where: { problemId: problem.id },
        });

        if (!existingExplanation) {
            // Generate in background (don't await)
            generateExplanation(title, code, language)
                .then((explanation) => {
                    return prisma.aIExplanation.create({
                        data: {
                            problemId: problem.id,
                            approachTag: explanation.approach_tag,
                            coreIdea: explanation.core_idea,
                            explanationSteps: JSON.stringify(explanation.explanation_steps),
                            complexity: JSON.stringify(explanation.complexity),
                            keyInsight: explanation.key_insight,
                            commonPitfall: explanation.common_pitfall,
                            difficultyRating: explanation.difficulty_rating,
                            roast: explanation.roast,
                        },
                    });
                })
                .catch((error) => {
                    console.error('Background AI generation failed:', error);
                });
        }

        return NextResponse.json({
            success: true,
            problem: { id: problem.id, slug: problem.slug },
        });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json(
            { error: 'Failed to sync problem' },
            { status: 500 }
        );
    }
}
