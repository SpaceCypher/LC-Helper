#!/usr/bin/env node
/**
 * Redistribution Script: Spread existing problems across dates with daily cap
 * 
 * This script redistributes all existing revisions to respect the 3-problem daily cap.
 * It fetches all revisions, sorts them by their current nextReview date, and then
 * redistributes them starting from 2 days from now, placing max 3 per day.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DAILY_LIMIT = 3;

async function redistributeRevisions() {
    try {
        console.log('🔍 Fetching all revisions...');

        // Get all revisions sorted by nextReview
        const allRevisions = await prisma.revision.findMany({
            orderBy: {
                nextReview: 'asc',
            },
            include: {
                problem: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
            },
        });

        console.log(`📊 Found ${allRevisions.length} problems to redistribute`);

        if (allRevisions.length === 0) {
            console.log('✅ No problems to redistribute');
            return;
        }

        // Calculate distribution
        const totalDaysNeeded = Math.ceil(allRevisions.length / DAILY_LIMIT);
        console.log(`📅 Will spread across ${totalDaysNeeded} days (${DAILY_LIMIT} problems/day)`);

        // Start from 2 days from now
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() + 2);

        let currentDate = new Date(startDate);
        let problemsScheduledToday = 0;
        const updates = [];

        console.log(`\n📌 Starting redistribution from: ${currentDate.toDateString()}\n`);

        for (const revision of allRevisions) {
            // If we've scheduled 3 problems for current day, move to next day
            if (problemsScheduledToday >= DAILY_LIMIT) {
                currentDate.setDate(currentDate.getDate() + 1);
                problemsScheduledToday = 0;
            }

            // Schedule this problem for current date
            updates.push({
                id: revision.id,
                nextReview: new Date(currentDate),
                title: revision.problem.title,
            });

            problemsScheduledToday++;
        }

        // Show preview
        console.log('📋 Distribution preview:');
        const preview = {};
        updates.forEach(({ nextReview, title }) => {
            const dateStr = nextReview.toDateString();
            if (!preview[dateStr]) {
                preview[dateStr] = [];
            }
            preview[dateStr].push(title);
        });

        Object.entries(preview).forEach(([date, titles]) => {
            console.log(`\n${date} (${titles.length} problems):`);
            titles.forEach((title, i) => {
                console.log(`  ${i + 1}. ${title}`);
            });
        });

        // Confirm
        console.log(`\n⚠️  About to update ${updates.length} revisions`);
        console.log('Press Enter to continue or Ctrl+C to cancel...');

        // Wait for user input (in Node.js environment)
        await new Promise((resolve) => {
            process.stdin.once('data', resolve);
        });

        // Execute updates
        console.log('\n🔄 Updating revisions...');
        let updated = 0;

        for (const { id, nextReview } of updates) {
            await prisma.revision.update({
                where: { id },
                data: { nextReview },
            });
            updated++;

            if (updated % 10 === 0) {
                console.log(`  Progress: ${updated}/${updates.length}`);
            }
        }

        console.log(`\n✅ Successfully redistributed ${updated} problems!`);
        console.log(`📅 Spread across ${totalDaysNeeded} days starting from ${startDate.toDateString()}`);

    } catch (error) {
        console.error('❌ Error redistributing revisions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
redistributeRevisions()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
