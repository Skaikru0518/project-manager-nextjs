import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  id: string
  email: string
}

// Edge-compatible token verification for middleware
export async function verifyTokenEdge(token: string): Promise<User | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    return {
      id: payload.id as string,
      email: payload.email as string
    }
  } catch (error) {
    return null
  }
}