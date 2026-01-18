import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const session: any = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { startTime, endTime, description } = await req.json()

        if (!startTime || !endTime || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const entry = await prisma.timeEntry.create({
            data: {
                userId: session.userId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                description,
                isManual: true,
            },
        })

        return NextResponse.json(entry, { status: 201 })
    } catch (error) {
        console.error('Manual entry error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
