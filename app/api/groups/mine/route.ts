// app/api/groups/mine/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'

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

  const memberRows = await prisma.userGroups.findMany({
    where: { userId: payload.userId },
  })
  const groupIds = memberRows.map((r) => r.groupId)

  if (groupIds.length === 0) {
    return NextResponse.json([])
  }

  const [groups, allMemberRows] = await Promise.all([
    prisma.group.findMany({ where: { id: { in: groupIds } } }),
    prisma.userGroups.findMany({ where: { groupId: { in: groupIds } } }),
  ])

  const membersByGroup = new Map<string, string[]>()
  for (const row of allMemberRows) {
    const list = membersByGroup.get(row.groupId) ?? []
    list.push(row.userId)
    membersByGroup.set(row.groupId, list)
  }

  const myGroups = groups.map((group) => ({
    ...group,
    members: membersByGroup.get(group.id) ?? [],
  }))

  return NextResponse.json(myGroups)
}