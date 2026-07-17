import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'

// GET /api/grocery — lists grocery lists for groups the signed-in user belongs to
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

  const myGroups = await prisma.userGroups.findMany({
    where: { userId: payload.userId },
  })
  const groupIds = myGroups.map((g) => g.groupId)

  if (groupIds.length === 0) {
    return NextResponse.json([])
  }

  const lists = await prisma.groceryList.findMany({
    where: { groupId: { in: groupIds } },
  })

  return NextResponse.json(lists)
}

// POST /api/grocery — create a new grocery list for a group the user belongs to
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

  const { groupId } = await request.json()
  if (!groupId) {
    return NextResponse.json({ error: 'groupId is required' }, { status: 400 })
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  const membership = await prisma.userGroups.findFirst({
    where: { groupId, userId: payload.userId },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
  }

  const newList = await prisma.groceryList.create({
    data: {
      id: randomUUID(),
      groupId,
    },
  })

  return NextResponse.json(newList, { status: 201 })
}