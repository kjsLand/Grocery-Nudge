import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { readDb } from '@/lib/db'

const DB_NAME = "users"

type User = {
  id: string
  email: string
  passwordHash: string
  createdAt: string
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const db = readDb<User>(DB_NAME)
  const user = db.items.find(u => u.id === payload.userId)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ id: user.id, email: user.email, createdAt: user.createdAt })
}