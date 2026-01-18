import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
        where: { email: 'raghavender0412@gmail.com' },
        update: {},
        create: {
            email: 'raghavender0412@gmail.com',
            name: 'Raghavender',
            password: hashedPassword,
            role: 'EMPLOYEE',
        },
    })

    const userId = employee.id

    // Cleanup existing logs for this user to avoid duplication on re-seed
    await prisma.timeEntry.deleteMany({
        where: { userId }
    })

    const pastLogs = [
        {
            startTime: new Date('2026-01-12T09:00:00'),
            endTime: new Date('2026-01-12T13:00:00'),
            description: `Worked on initial setup and base implementation for phase-1 internal admin tool:
- Upload CSVs from existing tools (donations, tuition, events)
- Normalize people -> families -> transactions
- Family View: list of households with total giving/fees + detail per family
No login system, no payments, not public deployment yet. Admin validation tool only.
Goal is to demo using CSVs from companies (Eventbrite etc.) once pipeline is working.`,
        },
        {
            startTime: new Date('2026-01-13T09:00:00'),
            endTime: new Date('2026-01-13T13:00:00'),
            description: `Phase-1 base progress: imports, people list, person timelines working.
Next work focused on household layer:
- Create Families from shared addresses / signals
- Link people to families
- Roll transactions up to families
- Add Family list view + Family detail view`,
        },
        {
            startTime: new Date('2026-01-14T09:00:00'),
            endTime: new Date('2026-01-14T12:00:00'),
            description: `Implemented CSV import logic for People + Families/Households and matching rules.
Key logic:
- Person matching priority: same email (case-insensitive), else same phone, else same email + same last name
- Family/household grouping (best effort): shared exact phone -> same family, else shared exact email -> same family, optionally group by address if clearly matching. Leave unlinked if no overlap.
- Kept matching/householding logic in separate module for future Phase 1B upgrade (Minara ID)
- Store reason for grouping (example: grouped_by = PHONE / EMAIL / ADDRESS)`,
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
