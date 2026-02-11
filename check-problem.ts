
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const problem = await prisma.problem.findUnique({
        where: { slug: 'valid-perfect-square' },
    });
    console.log('Problem found:', problem);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
