import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get manager's organization
        const manager = await prisma.user.findUnique({
            where: { id: session.id },
            select: { organizationId: true }
        })

        if (!manager?.organizationId) {
            return NextResponse.json({ error: 'Manager has no organization' }, { status: 400 })
        }

        const employees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE',
                organizationId: manager.organizationId  // Filter by organization
            },
            select: {
                id: true,
                email: true,
                name: true,
                currentTask: true,
                timeEntries: {
                    select: {
                        startTime: true,
                        endTime: true
                    }
                }
            }
        })

        const employeesWithHours = employees.map((emp: any) => {
            const totalMs = emp.timeEntries.reduce((acc: number, log: any) => {
                const start = new Date(log.startTime).getTime()
                const end = log.endTime ? new Date(log.endTime).getTime() : new Date().getTime()
                return acc + (end - start)
            }, 0)

            const totalHours = (totalMs / (1000 * 60 * 60)).toFixed(2)

            // Remove logs to keep payload light
            const { timeEntries, ...rest } = emp
            return {
                ...rest,
                totalHours // Return total hours
            }
        })

        return NextResponse.json(employeesWithHours)
    } catch (error: any) {
        console.error('Employees API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
