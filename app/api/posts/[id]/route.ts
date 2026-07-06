import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

const DB_NAME = "posts"

type Post = {
  id: string
  title: string
  content: string
  createdAt: string
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const db = readDb<Post>(DB_NAME)

  const postExists = db.items.some(p => p.id === id)
  if (!postExists) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  db.items = db.items.filter(p => p.id !== id)
  writeDb(DB_NAME, db)

  return NextResponse.json({ success: true })
}