import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { prisma } from '@/lib/prisma'

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

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ id: user.id, username: user.username, phone: user.phone, createdAt: user.createdAt })
}