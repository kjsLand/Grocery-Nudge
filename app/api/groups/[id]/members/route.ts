// app/api/groups/[id]/members/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'

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
  const group = await prisma.group.findUnique({ where: { id } })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  const rows = await prisma.userGroups.findMany({ where: { groupId: id } })
  return NextResponse.json(rows.map((r) => r.userId))
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
  const group = await prisma.group.findUnique({ where: { id } })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  const existing = await prisma.userGroups.findFirst({
    where: { groupId: id, userId: payload.userId },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already a member' }, { status: 409 })
  }

  await prisma.userGroups.create({
    data: { id: randomUUID(), userId: payload.userId, groupId: id },
  })

  const members = await prisma.userGroups.findMany({ where: { groupId: id } })
  return NextResponse.json({ ...group, members: members.map((m) => m.userId) })
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
  const group = await prisma.group.findUnique({ where: { id } })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  const existing = await prisma.userGroups.findFirst({
    where: { groupId: id, userId: payload.userId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 400 })
  }

  await prisma.userGroups.delete({ where: { id: existing.id } })

  const members = await prisma.userGroups.findMany({ where: { groupId: id } })
  return NextResponse.json({ ...group, members: members.map((m) => m.userId) })
}