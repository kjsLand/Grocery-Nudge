import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'

// GET /api/groups — list all groups
export async function GET() {
  const [groups, userGroups] = await Promise.all([
    prisma.group.findMany(),
    prisma.userGroups.findMany(),
  ])

  const membersByGroup = new Map<string, string[]>()
  for (const ug of userGroups) {
    const list = membersByGroup.get(ug.groupId) ?? []
    list.push(ug.userId)
    membersByGroup.set(ug.groupId, list)
  }

  const result = groups.map((group) => ({
    ...group,
    members: membersByGroup.get(group.id) ?? [],
  }))

  return NextResponse.json(result)
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

  const groupId = randomUUID()

  const [newGroup] = await prisma.$transaction([
    prisma.group.create({
      data: {
        id: groupId,
        title,
        leaderId: payload.userId,
      },
    }),
    prisma.userGroups.create({
      data: {
        id: randomUUID(),
        userId: payload.userId,
        groupId: groupId,
      },
    }),
  ])

  return NextResponse.json(
    { ...newGroup, members: [payload.userId] },
    { status: 201 }
  )
}