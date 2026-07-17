import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/session'

// GET /api/users?id=xxx           — single user's phone number
// GET /api/users?ids=id1,id2,id3  — batch lookup, e.g. for a members list
export async function GET(request: Request) {
  const token = (await cookies()).get('session')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const idsParam = searchParams.get('ids')

  if (!id && !idsParam) {
    return NextResponse.json({ error: 'id or ids is required' }, { status: 400 })
  }

  if (id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, phone: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(user)
  }

  const ids = idsParam!.split(',').map((v) => v.trim()).filter(Boolean)
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, phone: true },
  })

  return NextResponse.json(users)
}