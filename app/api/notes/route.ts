import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/notes?slug=two-sum
 * Fetch all notes for a problem
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { error: 'Problem slug is required' },
                { status: 400 }
            );
        }

        const problem = await prisma.problem.findUnique({
            where: { slug },
            include: { notes: { orderBy: { createdAt: 'asc' } } },
        });

        if (!problem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ notes: problem.notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notes' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/notes
 * Create a new note for a problem
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, type, content } = body;

        if (!slug || !type || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, type, content' },
                { status: 400 }
            );
        }

        if (type !== 'RECALL' && type !== 'DEEP') {
            return NextResponse.json(
                { error: 'Invalid note type. Must be RECALL or DEEP' },
                { status: 400 }
            );
        }

        const problem = await prisma.problem.findUnique({
            where: { slug },
        });

        if (!problem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        const note = await prisma.note.create({
            data: {
                problemId: problem.id,
                type,
                content,
            },
        });

        return NextResponse.json({ success: true, note });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json(
            { error: 'Failed to create note' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notes
 * Update an existing note
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, content } = body;

        if (!id || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: id, content' },
                { status: 400 }
            );
        }

        const note = await prisma.note.update({
            where: { id },
            data: { content },
        });

        return NextResponse.json({ success: true, note });
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json(
            { error: 'Failed to update note' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/notes?id=xyz
 * Delete a note
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Note ID is required' },
                { status: 400 }
            );
        }

        await prisma.note.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json(
            { error: 'Failed to delete note' },
            { status: 500 }
        );
    }
}
