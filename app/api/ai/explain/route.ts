import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateExplanation } from '@/lib/gemini';

/**
 * POST /api/ai/explain
 * Generate AI explanation for a problem
 * Only generates if explanation doesn't already exist
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug } = body;

        if (!slug) {
            return NextResponse.json(
                { error: 'Problem slug is required' },
                { status: 400 }
            );
        }

        // Find problem
        const problem = await prisma.problem.findUnique({
            where: { slug },
            include: {
                solution: true,
                explanation: true,
            },
        });

        if (!problem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        // Check if explanation already exists
        if (problem.explanation) {
            return NextResponse.json({
                success: true,
                explanation: {
                    ...problem.explanation,
                    explanationSteps: JSON.parse(problem.explanation.explanationSteps),
                    complexity: JSON.parse(problem.explanation.complexity),
                },
                cached: true,
            });
        }

        // Ensure solution exists
        if (!problem.solution) {
            return NextResponse.json(
                { error: 'No solution found for this problem' },
                { status: 404 }
            );
        }

        // Generate explanation
        const explanation = await generateExplanation(
            problem.title,
            problem.solution.code,
            problem.solution.language
        );

        // Store in database
        const stored = await prisma.aIExplanation.create({
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

        return NextResponse.json({
            success: true,
            explanation: {
                ...stored,
                explanationSteps: JSON.parse(stored.explanationSteps),
                complexity: JSON.parse(stored.complexity),
            },
            cached: false,
        });
    } catch (error) {
        console.error('AI explanation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate explanation' },
            { status: 500 }
        );
    }
}
