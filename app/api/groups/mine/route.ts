import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDb } from '@/lib/db'
import { verifySessionToken } from '@/lib/session'

const DB_NAME = "group"

type Group = {
  id: string
  title: string
  group_leader: string
  members: Array<string>
}

// GET /api/groups/mine — list groups the current user belongs to
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

  const db = readDb<Group>(DB_NAME)

  const myGroups = db.items.filter(
    (group) =>
      group.group_leader === payload.userId ||
      group.members.includes(payload.userId)
  )

  return NextResponse.json(myGroups)
}