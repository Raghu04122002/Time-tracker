import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
}

export function signToken(payload: any) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

export interface Session {
    id: string
    email: string
    name: string
    role: 'MANAGER' | 'EMPLOYEE'
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    return verifyToken(token) as Session | null
}
