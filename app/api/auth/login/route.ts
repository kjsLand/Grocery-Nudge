import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { createSessionToken } from '@/lib/session'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  })

  // Same error whether the user doesn't exist or the password is wrong —
  // don't give attackers a way to enumerate valid usernames
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = createSessionToken(user.id)
  const response = NextResponse.json({ id: user.id, username: user.username })

  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}