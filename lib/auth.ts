import * as jose from 'jose'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'USER'
  level?: 'JUNIOR' | 'MEDIOR' | 'SENIOR'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function generateToken(user: User): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const token = await new jose.SignJWT({ id: user.id, email: user.email, name: user.name, role: user.role, level: user.level })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  return token
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
      role: payload.role as 'ADMIN' | 'USER',
      level: payload.level as 'JUNIOR' | 'MEDIOR' | 'SENIOR' | undefined
    }
  } catch (error) {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  const user = await verifyToken(token)
  if (!user) return null

  // Verify user still exists in database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  return dbUser ? { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role, level: dbUser.level } : null
}