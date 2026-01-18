import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(request: Request) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.id },
            data: { name },
        })

        return NextResponse.json({ user: updatedUser })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
