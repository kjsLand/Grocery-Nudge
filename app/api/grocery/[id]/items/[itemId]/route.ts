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

// Shared: confirm the list exists and the user is a member of its group
async function getListAndAuthorize(listId: string, userId: string) {
  const list = await prisma.groceryList.findUnique({ where: { id: listId } })
  if (!list) {
    return { error: NextResponse.json({ error: 'Grocery list not found' }, { status: 404 }) }
  }

  const membership = await prisma.userGroups.findFirst({
    where: { groupId: list.groupId, userId },
  })
  if (!membership) {
    return { error: NextResponse.json({ error: 'Not a member of this group' }, { status: 403 }) }
  }

  return { list }
}

// Shared: confirm the item exists and belongs to the given list
async function getItemOnList(listId: string, itemId: string) {
  const item = await prisma.groceryItem.findUnique({ where: { id: itemId } })
  if (!item || item.listId !== listId) {
    return { error: NextResponse.json({ error: 'Item not found on this list' }, { status: 404 }) }
  }
  return { item }
}

// DELETE /api/grocery/[id]/items/[itemId] — remove one item from a list
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: listId, itemId } = await params

  const auth = await requireUserId()
  if ('error' in auth) return auth.error

  const listAuth = await getListAndAuthorize(listId, auth.userId)
  if ('error' in listAuth) return listAuth.error

  const itemCheck = await getItemOnList(listId, itemId)
  if ('error' in itemCheck) return itemCheck.error

  await prisma.groceryItem.delete({ where: { id: itemId } })

  return NextResponse.json({ success: true })
}

// PATCH /api/grocery/[id]/items/[itemId] — update fields on a single item (e.g. assignedId)
// Body: { assignedId?: string, name?: string, quantity?: number, price?: number, isCompleted?: boolean }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: listId, itemId } = await params

  const auth = await requireUserId()
  if ('error' in auth) return auth.error

  const listAuth = await getListAndAuthorize(listId, auth.userId)
  if ('error' in listAuth) return listAuth.error

  const itemCheck = await getItemOnList(listId, itemId)
  if ('error' in itemCheck) return itemCheck.error

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if ('assignedId' in body) data.assignedId = body.assignedId
  if ('name' in body) data.name = body.name
  if ('quantity' in body) data.quantity = body.quantity
  if ('price' in body) data.price = body.price
  if ('isCompleted' in body) data.isCompleted = body.isCompleted

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const updated = await prisma.groceryItem.update({
    where: { id: itemId },
    data,
  })

  return NextResponse.json(updated)
}