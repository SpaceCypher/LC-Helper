
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Try to find by number first
    let problem = await prisma.problem.findFirst({
        where: { problemNumber: 33 },
    });

    // If not found by number, try title
    if (!problem) {
        console.log('Not found by number 33, trying title...');
        problem = await prisma.problem.findFirst({
            where: { title: "Search in Rotated Sorted Array" }
        });
    }

    if (!problem) {
        console.log('Problem not found in database.');
        return;
    }

    console.log('Found problem:', {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        number: problem.problemNumber
    });

    // Delete the problem
    const deleted = await prisma.problem.delete({
        where: { id: problem.id },
    });

    console.log('Successfully deleted problem:', deleted.title);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
