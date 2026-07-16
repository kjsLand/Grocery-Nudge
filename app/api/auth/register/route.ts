import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { createSessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const { email, password, phone } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const newUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      phone: phone,
      createdAt: new Date().toISOString(),
    },
  })

  // Log the user in immediately after registering
  const token = createSessionToken(newUser.id)
  const response = NextResponse.json({ id: newUser.id, email: newUser.email }, { status: 201 })

  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}