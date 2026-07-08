import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDb, writeDb } from '@/lib/db'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'

const DB_NAME = "group"

type Group = {
  id: string
  title: string
  members: Array<string>
}

// GET /api/groups — list all groups
export async function GET() {
  const db = readDb<Group>(DB_NAME)
  return NextResponse.json(db.items)
}

// POST /api/groups — create a new group, current user becomes first member
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const { title } = await request.json()

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const db = readDb<Group>(DB_NAME)

  const newGroup: Group = {
    id: randomUUID(),
    title,
    members: [payload.userId],
  }

  db.items.push(newGroup)
  writeDb(DB_NAME, db)

  return NextResponse.json(newGroup, { status: 201 })
}



// Delete a group

// Get group members

// Join a group

// Remove from group