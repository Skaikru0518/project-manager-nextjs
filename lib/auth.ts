import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  id: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  const user = verifyToken(token)
  if (!user) return null

  // Verify user still exists in database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  return dbUser ? { id: dbUser.id, email: dbUser.email } : null
}