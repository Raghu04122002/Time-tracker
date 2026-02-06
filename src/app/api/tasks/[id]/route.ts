import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PATCH - Update task status
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session: any = await getSession()
        if (!session || !session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: taskId } = await context.params
        const { status } = await req.json()

        // Validate status
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        // Get task and user
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: {
                assignedToId: true,
                organizationId: true
            }
        })

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { organizationId: true, role: true }
        })

        // Check permissions
        // Employees can only update their own tasks
        // Managers can update any task in their organization
        if (user?.role === 'EMPLOYEE' && task.assignedToId !== session.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (user?.organizationId !== task.organizationId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Update task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json(updatedTask)
    } catch (error) {
        console.error('Update task error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session: any = await getSession()
        if (!session || !session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: taskId } = await context.params

        // Only managers can delete tasks
        if (session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get manager's organization
        const manager = await prisma.user.findUnique({
            where: { id: session.id },
            select: { organizationId: true }
        })

        if (!manager || !manager.organizationId) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        // Get the task to verify it belongs to manager's org
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { organizationId: true }
        })

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        if (task.organizationId !== manager.organizationId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete the task
        await prisma.task.delete({
            where: { id: taskId }
        })

        return NextResponse.json({ message: 'Task deleted successfully' })
    } catch (error) {
        console.error('Delete task error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
