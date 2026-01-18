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
            }
        })

        return NextResponse.json(employees)
    } catch (error: any) {
        console.error('Employees API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
