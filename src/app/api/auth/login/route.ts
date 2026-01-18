import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !(await comparePassword(password, user.password))) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const token = signToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        })

        const response = NextResponse.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, role: user.role, name: user.name },
        })

        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
