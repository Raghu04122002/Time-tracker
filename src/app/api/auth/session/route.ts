import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!session.id) {
            console.error('Session API: No ID in session', session)
            return NextResponse.json({ error: 'Invalid Session' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                currentTask: true,
            }
        })

        if (!user) {
            console.error('Session API: User not found in DB', session.id)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error: any) {
        console.error('Session API Error:', error)
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
