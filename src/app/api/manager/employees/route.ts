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

        const employees = await prisma.user.findMany({
            where: { role: 'EMPLOYEE' },
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
