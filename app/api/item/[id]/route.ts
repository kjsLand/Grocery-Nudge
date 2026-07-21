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