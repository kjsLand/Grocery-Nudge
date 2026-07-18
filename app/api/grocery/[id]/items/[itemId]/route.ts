import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'

async function requireUserId(): Promise<{ userId: string } | { error: NextResponse }> {
  const token = (await cookies()).get('session')?.value
  if (!token) {
    return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) }
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return { error: NextResponse.json({ error: 'Session expired' }, { status: 401 }) }
  }

  return { userId: payload.userId }
}

// DELETE /api/grocery/[id]/items/[itemId] — remove one item from a list
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: listId, itemId } = await params

  const auth = await requireUserId()
  if ('error' in auth) return auth.error

  const list = await prisma.groceryList.findUnique({ where: { id: listId } })
  if (!list) {
    return NextResponse.json({ error: 'Grocery list not found' }, { status: 404 })
  }

  const membership = await prisma.userGroups.findFirst({
    where: { groupId: list.groupId, userId: auth.userId },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
  }

  const item = await prisma.groceryItem.findUnique({ where: { id: itemId } })
  if (!item || item.listId !== listId) {
    return NextResponse.json({ error: 'Item not found on this list' }, { status: 404 })
  }

  await prisma.groceryItem.delete({ where: { id: itemId } })

  return NextResponse.json({ success: true })
}