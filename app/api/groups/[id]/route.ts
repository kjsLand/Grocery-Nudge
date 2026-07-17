import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'

async function requireUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySessionToken(token)
}

// GET /api/groups/:id — fetch a single group
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const group = await prisma.group.findUnique({ where: { id } })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  return NextResponse.json(group)
}

// DELETE /api/groups/:id — delete a group (members only)
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

  const membership = await prisma.userGroups.findFirst({
    where: { groupId: id, userId: payload.userId },
  })

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
  }

  await prisma.$transaction([
    prisma.userGroups.deleteMany({ where: { groupId: id } }),
    prisma.group.delete({ where: { id } }),
  ])

  return NextResponse.json({ success: true })
}