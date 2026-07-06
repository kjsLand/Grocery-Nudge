// app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

// GET /api/posts — list all posts
export async function GET() {
  const db = readDb()
  return NextResponse.json(db.posts)
}

// POST /api/posts — create a new post
export async function POST(request: Request) {
  const { title, content } = await request.json()

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const db = readDb()

  const newPost = {
    id: db.posts.length > 0 ? Math.max(...db.posts.map(p => p.id)) + 1 : 1,
    title,
    content: content ?? '',
    createdAt: new Date().toISOString(),
  }

  db.posts.push(newPost)
  writeDb(db)

  return NextResponse.json(newPost, { status: 201 })
}