const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const cvus = await prisma.cvu.findMany();
    console.log('CVUs in DB:', JSON.stringify(cvus, null, 2));
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
