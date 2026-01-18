
import prisma from './src/lib/prisma';

async function clearTask() {
    console.log('--- Simulating Task Clearing ---');
    const employee = await prisma.user.findFirst({
        where: { role: 'EMPLOYEE' }
    });

    if (!employee) {
        console.log('No employee found');
        return;
    }

    console.log(`Current Task for ${employee.name}:`, employee.currentTask);

    console.log('Attempting to set currentTask to null...');
    const updated = await prisma.user.update({
        where: { id: employee.id },
        data: { currentTask: null }
    });

    console.log(`New Task Status:`, updated.currentTask);
}

clearTask()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
