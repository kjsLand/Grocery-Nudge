import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readDb, writeDb } from '@/lib/db'
import { verifySessionToken } from '@/lib/session'
import { randomUUID } from 'crypto'

const DB_NAME = "invites"

type Invite = {
  id: string
  group_id: string
  number: string
}

// GET /api/invites — list all invites
export async function GET() {
  const db = readDb<Invite>(DB_NAME)
  return NextResponse.json(db.items)
}