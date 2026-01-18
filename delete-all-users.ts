
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllUsers() {
    console.log('--- Deleting All Users ---');
    try {
        const { count } = await prisma.user.deleteMany({});
        console.log(`Successfully deleted ${count} users.`);

        // Optional: Count surviving logs to confirm preservation
        const logsCount = await prisma.timeEntry.count();
        console.log(`Preserved ${logsCount} time entries in the database.`);

    } catch (error) {
        console.error('Error deleting users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllUsers();
