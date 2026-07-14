import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDb, writeDb } from '@/lib/db'
import { verifySessionToken } from '@/lib/session'
import { Invite } from '@/lib/types'

const DB_NAME = "invite"

async function requireUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySessionToken(token)
}


// DELETE /api/invites/:id — delete/revoke an invite
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await requireUser()
  if (!payload) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { id } = await params
  const db = readDb<Invite>(DB_NAME)
  const invite = db.items.find((i) => i.id === id)

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  db.items = db.items.filter((i) => i.id !== id)
  writeDb(DB_NAME, db)

  return NextResponse.json({ success: true })
}