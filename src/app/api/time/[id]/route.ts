
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const id = resolvedParams.id

        // Verify the log exists and belongs to the user
        const entry = await prisma.timeEntry.findUnique({
            where: { id },
            include: { user: true } // Include user to check role if needed later
        })

        if (!entry) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 })
        }

        // Allow delete if it's the user's own log OR if the requester is a MANAGER
        if (entry.userId !== session.id && session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Proceed to delete
        // Note: Because of our schema change, this actually deletes the record.
        // It won't be "orphaned" because we are calling delete on the entry itself.
        await prisma.timeEntry.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete log error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
