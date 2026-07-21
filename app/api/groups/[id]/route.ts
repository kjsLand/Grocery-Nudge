import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Prisma } from '@prisma/client'
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

// PATCH /api/groups/:id — update group info (members only)
export async function PATCH(
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

  const { title, description, img, type } = await request.json()

  const data: Prisma.GroupUpdateInput = {}

  if (title !== undefined) {
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    }
    data.title = title
  }

  if (description !== undefined) data.description = description
  if (img !== undefined) data.image = img

  if (type !== undefined) {
    if (type !== "SPLITTER" && type !== "GROCERY_LIST") {
      return NextResponse.json({ error: 'Invalid group type' }, { status: 400 })
    }
    data.type = type
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const updated = await prisma.group.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json(
      { error: 'You already have a group with this title' },
      { status: 409 }
    )
  }
}