import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'


// GET /api/groups — list all groups
export async function GET() {
  const groups = await prisma.group.findMany()
  return NextResponse.json(groups)
}

// POST /api/groups — create a new group, current user becomes first member
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const { title, description, img, type } = await request.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (type != "SPLITTER" && type != "GROCERY_LIST") {
    return NextResponse.json({ error: 'Invalid group type' }, { status: 400 })
  }

  const groupId = randomUUID()

  try {
    const [newGroup] = await prisma.$transaction([
      prisma.group.create({
        data: {
          id: groupId,
          title,
          description: description,
          image: img,
          type: type,
          leaderId: payload.userId,
        },
      }),
      prisma.userGroups.create({
        data: {
          id: randomUUID(),
          userId: payload.userId,
          groupId,
        },
      }),
      prisma.groceryList.create({
        data: {
          id: randomUUID(),
          groupId
        }
      }),
    ])

    return NextResponse.json(
      { ...newGroup, members: [payload.userId] },
      { status: 201 }
    )
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'You already have a group with this title' },
        { status: 409 }
      )
    }

    console.error('Failed to create group:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}