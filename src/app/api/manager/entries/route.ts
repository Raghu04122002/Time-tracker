import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const session: any = await getSession()
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get manager's organization
        const manager = await prisma.user.findUnique({
            where: { id: session.id },
            select: { organizationId: true }
        })

        if (!manager?.organizationId) {
            return NextResponse.json({ error: 'Manager has no organization' }, { status: 400 })
        }

        const { searchParams } = new URL(req.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const entries = await prisma.timeEntry.findMany({
            where: {
                organizationId: manager.organizationId,  // Filter by organization
                ...(startDate && endDate ? {
                    startTime: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    }
                } : {})
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                startTime: 'desc',
            },
        })

        return NextResponse.json(entries)
    } catch (error) {
        console.error('Manager entries error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
