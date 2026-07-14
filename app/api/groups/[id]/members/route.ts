import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDb, writeDb } from '@/lib/db'
import { verifySessionToken } from '@/lib/session'
import { Group } from '@/lib/types'

const DB_NAME = "group"

async function requireUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySessionToken(token)
}

// GET /api/groups/:id/members — list a group's members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = readDb<Group>(DB_NAME)
  const group = db.items.find((g) => g.id === id)

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  return NextResponse.json(group.members)
}

// POST /api/groups/:id/members — join a group
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await requireUser()
  if (!payload) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { id } = await params
  const db = readDb<Group>(DB_NAME)
  const group = db.items.find((g) => g.id === id)

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  if (group.members.includes(payload.userId)) {
    return NextResponse.json({ error: 'Already a member' }, { status: 409 })
  }

  group.members.push(payload.userId)
  writeDb(DB_NAME, db)

  return NextResponse.json(group)
}

// DELETE /api/groups/:id/members — leave a group
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await requireUser()
  if (!payload) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { id } = await params
  const db = readDb<Group>(DB_NAME)
  const group = db.items.find((g) => g.id === id)

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  if (!group.members.includes(payload.userId)) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 400 })
  }

  group.members = group.members.filter((m) => m !== payload.userId)
  writeDb(DB_NAME, db)

  return NextResponse.json(group)
}