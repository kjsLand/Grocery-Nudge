// app/api/invites/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDb, writeDb } from '@/lib/db'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'
import { User, Invite } from '@/lib/types'

const DB_NAME = "invite"
const USERS_DB_NAME = "users"

// GET /api/invites — list invites for the signed-in user's phone number
// Optionally pass ?number=xxx to look up invites for a specific number instead
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const numberParam = searchParams.get('number')

  let targetNumber = numberParam

  if (!targetNumber) {
    const token = (await cookies()).get('session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    const payload = verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const usersDb = readDb<User>(USERS_DB_NAME) ?? { items: [] }
    const user = usersDb.items.find(u => u.id === payload.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    targetNumber = user.phone
  }

  const db = readDb<Invite>(DB_NAME) ?? { items: [] }
  const invites = db.items.filter(invite => invite.number === targetNumber)

  return NextResponse.json(invites)
}

// POST /api/invites — create an invite for a phone number
export async function POST(request: Request) {
  const sessionToken = (await cookies()).get('session')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const session = verifySessionToken(sessionToken)
  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  }

  const { group_id, number } = await request.json()

  if (!group_id || !number) {
    return NextResponse.json({ error: 'group_id and number are required' }, { status: 400 })
  }

  const db = readDb<Invite>(DB_NAME) ?? { items: [] }

  const existing = db.items.find(
    invite => invite.group_id === group_id && invite.number === number
  )
  if (existing) {
    return NextResponse.json({ error: 'An invite for this number already exists for this group' }, { status: 409 })
  }

  const newInvite: Invite = {
    id: randomUUID(),
    group_id,
    number,
    invitedBy: session.userId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  db.items.push(newInvite)
  writeDb(DB_NAME, db)

  return NextResponse.json(newInvite, { status: 201 })
}