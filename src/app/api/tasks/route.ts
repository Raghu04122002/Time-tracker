import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Fetch tasks based on user role
export async function GET(req: Request) {
    try {
        const session: any = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's organization
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { organizationId: true, role: true }
        })

        if (!user?.organizationId) {
            return NextResponse.json({ error: 'User has no organization' }, { status: 400 })
        }

        let tasks

        if (user.role === 'MANAGER') {
            // Managers see all tasks in their organization
            tasks = await prisma.task.findMany({
                where: {
                    organizationId: user.organizationId
                },
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
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        } else {
            // Employees see only their assigned tasks
            tasks = await prisma.task.findMany({
                where: {
                    assignedToId: session.id,
                    organizationId: user.organizationId
                },
                include: {
                    assignedBy: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        }

        return NextResponse.json(tasks)
    } catch (error) {
        console.error('Fetch tasks error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create new task (manager only)
export async function POST(req: Request) {
    try {
        const session: any = await getSession()
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { title, description, assignedToId, dueDate } = await req.json()

        if (!title || !assignedToId) {
            return NextResponse.json({ error: 'Title and assignedToId are required' }, { status: 400 })
        }

        // Get manager's organization
        const manager = await prisma.user.findUnique({
            where: { id: session.id },
            select: { organizationId: true }
        })

        if (!manager?.organizationId) {
            return NextResponse.json({ error: 'Manager has no organization' }, { status: 400 })
        }

        // Verify the assigned employee is in the same organization
        const employee = await prisma.user.findUnique({
            where: { id: assignedToId },
            select: { organizationId: true }
        })

        if (employee?.organizationId !== manager.organizationId) {
            return NextResponse.json({ error: 'Cannot assign task to employee in different organization' }, { status: 403 })
        }

        // Create the task
        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                assignedById: session.id,
                assignedToId,
                organizationId: manager.organizationId,
                dueDate: dueDate ? new Date(dueDate) : null
            },
            include: {
                assignedTo: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json(task, { status: 201 })
    } catch (error) {
        console.error('Create task error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
