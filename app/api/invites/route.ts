import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET /api/invites — list invites for the signed-in user
// Optionally pass ?number=xxx to look up invites for a specific phone number instead
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const numberParam = searchParams.get('number')

  let targetUserId: string

  if (numberParam) {
    // Phone isn't unique in the schema, so this could match multiple users.
    // Using the first match — tighten this if that's not acceptable.
    const user = await prisma.user.findFirst({
      where: { phone: numberParam },
    })
    if (!user) {
      return NextResponse.json({ error: 'No user found for that number' }, { status: 404 })
    }
    targetUserId = user.id
  } else {
    const token = (await cookies()).get('session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    const payload = verifySessionToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    targetUserId = user.id
  }

  const invites = await prisma.invite.findMany({
    where: { receiverId: targetUserId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invites)
}

// POST /api/invites — create an invite for a phone number
export async function POST(request: Request) {
  const sessionToken = (await cookies()).get('session')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const session = verifySessionToken(sessionToken)
  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  }

  const { group_id, number } = await request.json()

  if (!group_id || !number) {
    return NextResponse.json({ error: 'group_id and number are required' }, { status: 400 })
  }

  // Resolve the phone number to a receiving user
  const receiver = await prisma.user.findFirst({
    where: { phone: number },
  })
  if (!receiver) {
    return NextResponse.json({ error: 'No user found for that number' }, { status: 404 })
  }

  const existing = await prisma.invite.findFirst({
    where: { groupId: group_id, receiverId: receiver.id },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'An invite for this number already exists for this group' },
      { status: 409 }
    )
  }

  const newInvite = await prisma.invite.create({
    data: {
      groupId: group_id,
      senderId: session.userId,
      receiverId: receiver.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  })

  return NextResponse.json(newInvite, { status: 201 })
}