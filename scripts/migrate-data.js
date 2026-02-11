const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

// Initialize Prisma for Postgres (Destination)
const prisma = new PrismaClient();

// Initialize SQLite (Source)
const dbPath = path.resolve(__dirname, '../dev.db');

if (!fs.existsSync(dbPath)) {
    console.error(`❌ dev.db not found at ${dbPath}`);
    process.exit(1);
}

const sqlite = new sqlite3.Database(dbPath);

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        sqlite.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function migrate() {
    console.log('🚀 Starting migration from SQLite to Supabase...');

    try {
        // 1. Problems
        console.log('\n📦 Migrating Problems...');
        const problems = await query('SELECT * FROM Problem');
        for (const p of problems) {
            await prisma.problem.upsert({
                where: { slug: p.slug },
                create: {
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    difficulty: p.difficulty,
                    problemNumber: p.problemNumber,
                    description: p.description,
                    constraints: p.constraints,
                    examples: p.examples,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt)
                },
                update: {} // Skip if exists
            });
            process.stdout.write('.');
        }
        console.log(`\n✅ Migrated ${problems.length} problems`);

        // 2. Solutions
        console.log('\n💻 Migrating Solutions...');
        const solutions = await query('SELECT * FROM Solution');
        for (const s of solutions) {
            // Check if problem exists in destination
            const problemExists = await prisma.problem.findUnique({ where: { id: s.problemId } });
            if (!problemExists) continue;

            await prisma.solution.upsert({
                where: { problemId: s.problemId },
                create: {
                    id: s.id,
                    problemId: s.problemId,
                    language: s.language,
                    code: s.code,
                    submittedAt: new Date(s.submittedAt),
                    createdAt: new Date(s.createdAt),
                    updatedAt: new Date(s.updatedAt)
                },
                update: {}
            });
            process.stdout.write('.');
        }
        console.log(`\n✅ Migrated ${solutions.length} solutions`);

        // 3. Revisions
        console.log('\n📅 Migrating Revisions...');
        const revisions = await query('SELECT * FROM Revision');
        for (const r of revisions) {
            const problemExists = await prisma.problem.findUnique({ where: { id: r.problemId } });
            if (!problemExists) continue;

            await prisma.revision.upsert({
                where: { problemId: r.problemId },
                create: {
                    id: r.id,
                    problemId: r.problemId,
                    lastReviewed: r.lastReviewed ? new Date(r.lastReviewed) : null,
                    nextReview: new Date(r.nextReview),
                    revisionCount: r.revisionCount,
                    totalReviews: r.totalReviews || 0,
                    confidenceScore: r.confidenceScore,
                    createdAt: new Date(r.createdAt),
                    updatedAt: new Date(r.updatedAt)
                },
                update: {}
            });
            process.stdout.write('.');
        }
        console.log(`\n✅ Migrated ${revisions.length} revisions`);

        // 4. AI Explanations
        console.log('\n🧠 Migrating AI Explanations...');
        const ai = await query('SELECT * FROM AIExplanation');
        for (const a of ai) {
            const problemExists = await prisma.problem.findUnique({ where: { id: a.problemId } });
            if (!problemExists) continue;

            await prisma.aIExplanation.upsert({
                where: { problemId: a.problemId },
                create: {
                    id: a.id,
                    problemId: a.problemId,
                    approachTag: a.approachTag,
                    coreIdea: a.coreIdea,
                    explanationSteps: a.explanationSteps,
                    complexity: a.complexity,
                    keyInsight: a.keyInsight,
                    commonPitfall: a.commonPitfall,
                    difficultyRating: a.difficultyRating,
                    roast: a.roast,
                    generatedAt: new Date(a.generatedAt)
                },
                update: {}
            });
            process.stdout.write('.');
        }
        console.log(`\n✅ Migrated ${ai.length} explanations`);

        // 5. Notes
        console.log('\n📝 Migrating Notes...');
        const notes = await query('SELECT * FROM Note');
        for (const n of notes) {
            const problemExists = await prisma.problem.findUnique({ where: { id: n.problemId } });
            if (!problemExists) continue;

            await prisma.note.create({
                data: {
                    id: n.id,
                    problemId: n.problemId,
                    type: n.type,
                    content: n.content,
                    createdAt: new Date(n.createdAt),
                    updatedAt: new Date(n.updatedAt)
                }
            });
            process.stdout.write('.');
        }
        console.log(`\n✅ Migrated ${notes.length} notes`);

    } catch (e) {
        console.error('\n❌ Migration Failed:', e);
    } finally {
        await prisma.$disconnect();
        sqlite.close();
    }
}

migrate();
