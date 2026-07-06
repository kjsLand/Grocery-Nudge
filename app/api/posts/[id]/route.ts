// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  const db = readDb()

  const postExists = db.posts.some(p => p.id === id)
  if (!postExists) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  db.posts = db.posts.filter(p => p.id !== id)
  writeDb(db)

  return NextResponse.json({ success: true })
}