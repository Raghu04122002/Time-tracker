import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request) {
    const session = await getSession()
    if (!session || session.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        console.log('ASSIGN_TASK_BODY:', body)

        const { userId, task } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Clean the task value: treat empty string, null, or undefined as null
        const cleanTask = (!task || typeof task !== 'string' || task.trim() === '') ? null : task.trim()

        console.log(`Updating User ${userId} task to: ${cleanTask} (Original: "${task}")`)

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { currentTask: cleanTask },
        })

        return NextResponse.json({ user: updatedUser })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
