// imports
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

// delete: /api/item/[id]
export async function DELETE(
    request: Request,
  { params }: { params: Promise<{ id: string }> }
){
    // check current user
    const payload = await requireUser()
    if (!payload) {
        return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    // grab id
    const { id } = await params
    const item = await prisma.groceryItem.findUnique({ where: { id } })
    if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // TO-DO: Check if in group

    //prisma get item
    await prisma.$transaction([
        prisma.groceryItem.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
}

// update: /api/item/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // check current user
  const payload = await requireUser()
  if (!payload) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  // grab id
  const { id } = await params
  const item = await prisma.groceryItem.findUnique({ where: { id } })
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  // TO-DO: Check if in group

  // parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, quantity, price, isCompleted, assignedId } = body as Record<string, unknown>

  const data: Prisma.GroceryItemUpdateInput = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 })
    }
    data.name = name.trim()
  }

  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 0) {
      return NextResponse.json({ error: 'quantity must be a non-negative number' }, { status: 400 })
    }
    data.quantity = quantity
  }

  if (price !== undefined) {
    if (typeof price !== 'string') {
      return NextResponse.json({ error: 'price must be a string' }, { status: 400 })
    }
    data.price = price
  }

  if (isCompleted !== undefined) {
    if (typeof isCompleted !== 'boolean') {
      return NextResponse.json({ error: 'isCompleted must be a boolean' }, { status: 400 })
    }
    data.isCompleted = isCompleted
  }

  if (assignedId !== undefined) {
    if (assignedId !== "" && typeof assignedId !== 'string') {
      return NextResponse.json({ error: 'assignedId must be a string or null' }, { status: 400 })
    }
    data.assignedId = assignedId
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const updated = await prisma.groceryItem.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}