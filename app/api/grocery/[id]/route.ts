import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'

// DELETE /api/grocery/:id — delete a grocery list (and its items)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const token = (await cookies()).get('session')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const list = await prisma.groceryList.findUnique({ where: { id } })
  if (!list) {
    return NextResponse.json({ error: 'Grocery list not found' }, { status: 404 })
  }

  const membership = await prisma.userGroups.findFirst({
    where: { groupId: list.groupId, userId: payload.userId },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
  }

  // GroceryItem has no cascade delete configured in the schema (no @relation),
  // so orphaned items must be cleared out manually before removing the list.
  await prisma.$transaction([
    prisma.groceryItem.deleteMany({ where: { listId: id } }),
    prisma.groceryList.delete({ where: { id } }),
  ])

  return NextResponse.json({ success: true })
}