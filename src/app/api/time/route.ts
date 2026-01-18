import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const session: any = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if there's already an active session
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                userId: session.userId,
                endTime: null,
            },
        })

        if (activeEntry) {
            return NextResponse.json({ error: 'You already have an active session' }, { status: 400 })
        }

        const entry = await prisma.timeEntry.create({
            data: {
                userId: session.userId,
                startTime: new Date(),
            },
        })

        return NextResponse.json(entry, { status: 201 })
    } catch (error) {
        console.error('Clock-in error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session: any = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const entries = await prisma.timeEntry.findMany({
            where: {
                userId: session.userId,
                ...(startDate && endDate ? {
                    startTime: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    }
                } : {})
            },
            orderBy: {
                startTime: 'desc',
            },
        })

        return NextResponse.json(entries)
    } catch (error) {
        console.error('Fetch entries error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
