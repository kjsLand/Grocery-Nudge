import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { prisma } from '@/lib/prisma'

async function requireUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySessionToken(token)
}

// DELETE /api/invites/:id — delete/revoke an invite
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await requireUser()
  if (!payload) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { id } = await params

  const invite = await prisma.invite.findUnique({ where: { id } })
  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  if (invite.senderId != payload.userId && invite.receiverId != payload.userId) {
    return NextResponse.json({ error: 'Not the owner of invite' }, { status: 403 })
  }

  await prisma.invite.delete({ where: { id } })

  return NextResponse.json({ success: true })
}