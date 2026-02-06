import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const { name, email, password, role, organization } = await req.json()

        if (!name || !email || !password || !role || !organization) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        const hashedPassword = await hashPassword(password)

        // Normalize organization name (trim and proper case)
        const normalizedOrgName = organization.trim()

        // Find organization using case-insensitive search
        let org = await prisma.organization.findFirst({
            where: {
                name: {
                    equals: normalizedOrgName,
                    mode: 'insensitive'
                }
            }
        })

        // If not found, create with the normalized name
        if (!org) {
            org = await prisma.organization.create({
                data: { name: normalizedOrgName }
            })
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role.toUpperCase(),
                organizationId: org.id,
            },
        })

        return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

