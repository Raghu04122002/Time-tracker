import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const session: any = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { description } = await req.json()

        if (!description || description.trim() === '') {
            return NextResponse.json({ error: 'Description is mandatory for clocking out' }, { status: 400 })
        }

        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                userId: session.userId,
                endTime: null,
            },
        })

        if (!activeEntry) {
            return NextResponse.json({ error: 'No active session found' }, { status: 400 })
        }

        const entry = await prisma.timeEntry.update({
            where: { id: activeEntry.id },
            data: {
                endTime: new Date(),
                description,
            },
        })

        return NextResponse.json(entry)
    } catch (error) {
        console.error('Clock-out error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
