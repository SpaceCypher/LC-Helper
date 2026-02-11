const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Manually load env since dotenv is not installed
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection to Supabase...');
        const count = await prisma.problem.count();
        console.log('Connection Successful! ✅');
        console.log(`Found ${count} problems in the database.`);
    } catch (e) {
        console.error('Connection Failed ❌');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
