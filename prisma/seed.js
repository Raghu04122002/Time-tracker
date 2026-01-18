const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create Manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: {},
        create: {
            email: 'manager@example.com',
            name: 'Admin Manager',
            password: hashedPassword,
            role: 'MANAGER',
        },
    })

    // Create Employee (The User)
    const employee = await prisma.user.upsert({
        where: { email: 'employee@example.com' },
        update: {},
        create: {
            email: 'employee@example.com',
            name: 'Raghavender',
            password: hashedPassword,
            role: 'EMPLOYEE',
        },
    })

    const userId = employee.id

    const pastLogs = [
        {
            startTime: new Date('2026-01-12T09:00:00'),
            endTime: new Date('2026-01-12T13:00:00'),
            description: `Worked on initial setup and base implementation for phase-1 internal admin tool:
- Upload CSVs from existing tools (donations, tuition, events)
- Normalize people -> families -> transactions
- Family View: list of households with total giving/fees + detail per family`,
        },
        {
            startTime: new Date('2026-01-13T09:00:00'),
            endTime: new Date('2026-01-13T13:00:00'),
            description: `Phase-1 base progress: imports, people list, person timelines working.
Next work focused on household layer:
- Create Families from shared addresses / signals
- Link people to families
- Roll transactions up to families`,
        },
        {
            startTime: new Date('2026-01-14T09:00:00'),
            endTime: new Date('2026-01-14T12:00:00'),
            description: `Implemented CSV import logic for People + Families/Households and matching rules.
Key logic:
- Person matching priority: same email, phone, or name
- Family/household grouping (best effort)
- Kept matching logic separate for Phase 1B`,
        },
        {
            startTime: new Date('2026-01-15T09:00:00'),
            endTime: new Date('2026-01-15T12:00:00'),
            description: 'Deployed the app and tested using provided data; verified pipeline and outputs.',
        },
        {
            startTime: new Date('2026-01-17T10:00:00'),
            endTime: new Date('2026-01-17T12:00:00'),
            description: 'Fixed errors/bugs and implemented: Manual review feature, Flagging feature for records that need attention.',
        },
    ]

    for (const log of pastLogs) {
        await prisma.timeEntry.create({
            data: {
                userId,
                startTime: log.startTime,
                endTime: log.endTime,
                description: log.description,
                isManual: true,
            },
        })
    }

    // Create Permanent Log User (raghavender0412@gmail.com)
    const permanentUser = await prisma.user.upsert({
        where: { email: 'raghavender0412@gmail.com' },
        update: {},
        create: {
            email: 'raghavender0412@gmail.com',
            name: 'Permanent User',
            password: hashedPassword,
            role: 'EMPLOYEE',
        },
    })

    const permanentLogs = [
        {
            startTime: new Date('2026-01-12T09:00:00'),
            endTime: new Date('2026-01-12T13:00:00'),
            description: `Worked on initial setup and base implementation for phase-1 internal admin tool:
- Upload CSVs from existing tools (donations, tuition, events)
- Normalize people -> families -> transactions
- Family View: list of households with total giving/fees + detail per family`,
        },
        {
            startTime: new Date('2026-01-13T09:00:00'),
            endTime: new Date('2026-01-13T13:00:00'),
            description: `Phase-1 base progress: imports, people list, person timelines working.
Next work focused on household layer:
- Create Families from shared addresses / signals
- Link people to families
- Roll transactions up to families`,
        },
        {
            startTime: new Date('2026-01-14T09:00:00'),
            endTime: new Date('2026-01-14T12:00:00'),
            description: `Implemented CSV import logic for People + Families/Households and matching rules.
Key logic:
- Person matching priority: same email, phone, or name
- Family/household grouping (best effort)
- Kept matching logic separate for Phase 1B`,
        },
        {
            startTime: new Date('2026-01-15T09:00:00'),
            endTime: new Date('2026-01-15T12:00:00'),
            description: 'Deployed the app and tested using provided data; verified pipeline and outputs.',
        },
        {
            startTime: new Date('2026-01-17T10:00:00'),
            endTime: new Date('2026-01-17T12:00:00'),
            description: 'Fixed errors/bugs and implemented: Manual review feature, Flagging feature for records that need attention.',
        },
    ]

    for (const log of permanentLogs) {
        await prisma.timeEntry.create({
            data: {
                userId: permanentUser.id,
                startTime: log.startTime,
                endTime: log.endTime,
                description: log.description,
                isManual: true,
            },
        })
    }

    console.log('Seed data created successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
