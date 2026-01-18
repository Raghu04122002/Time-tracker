
import prisma from './src/lib/prisma';

async function checkTask() {
    console.log('--- Checking Employee Task Status ---');
    const employee = await prisma.user.findFirst({
        where: { role: 'EMPLOYEE' },
        select: {
            id: true,
            name: true,
            currentTask: true
        }
    });

    if (employee) {
        console.log(`User: ${employee.name}`);
        console.log(`Task: ${employee.currentTask === null ? 'NULL (No Task)' : `'${employee.currentTask}'`}`);
    } else {
        console.log('No employee found.');
    }
}

checkTask()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
