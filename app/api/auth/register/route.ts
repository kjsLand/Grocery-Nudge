import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { createSessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'
import { User } from '@/lib/types'

const DB_NAME = "users"

export async function POST(request: Request) {
  const { email, password, phone } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const db = readDb<User>(DB_NAME) ?? { items: [] }

  const existing = db.items.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const newUser: User = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    phone: phone,
    createdAt: new Date().toISOString(),
  }

  db.items.push(newUser)
  writeDb(DB_NAME, db)

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