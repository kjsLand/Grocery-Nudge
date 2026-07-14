import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDb, writeDb } from '@/lib/db'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'
import { Group, Invite } from '@/lib/types'

const GROUP_DB = "group"
const INVITE_DB = "invite"

async function requireUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySessionToken(token)
}

// POST /api/groups/:id/invite — invite someone to a group
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await requireUser()
  if (!payload) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { id } = await params
  const groupDb = readDb<Group>(GROUP_DB)
  const group = groupDb.items.find((g) => g.id === id)

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  // Only existing members (or the leader) can invite others
  if (!group.members.includes(payload.userId) && group.group_leader !== payload.userId) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const number = body?.number

  if (!number || typeof number !== 'string') {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  const inviteDb = readDb<Invite>(INVITE_DB)

  // Avoid duplicate pending invites to the same number for the same group
  const existing = inviteDb.items.find(
    (i) => i.group_id === id && i.number === number && i.status === 'pending'
  )
  if (existing) {
    return NextResponse.json({ error: 'Invite already pending for this number' }, { status: 409 })
  }

  const invite: Invite = {
    id: randomUUID(),
    group_id: id,
    number,
    invitedBy: payload.userId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  inviteDb.items.push(invite)
  writeDb(INVITE_DB, inviteDb)

  return NextResponse.json(invite, { status: 201 })
}