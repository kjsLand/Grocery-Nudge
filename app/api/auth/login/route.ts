import { NextResponse } from 'next/server'
import { readDb } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { createSessionToken } from '@/lib/session'

const DB_NAME = "users"

type User = {
  id: string
  email: string
  passwordHash: string
  phone: string
  createdAt: string
}


export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const db = readDb<User>(DB_NAME)
  const user = db.items.find(u => u.email.toLowerCase() === email.toLowerCase())

  // Same error whether the user doesn't exist or the password is wrong —
  // don't give attackers a way to enumerate valid emails
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = createSessionToken(user.id)
  const response = NextResponse.json({ id: user.id, email: user.email })

  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}