import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import { randomUUID } from 'crypto'

const DB_NAME = "posts"

type Post = {
  id: string
  title: string
  content: string
  createdAt: string
}

// GET /api/posts — list all posts
export async function GET() {
  const db = readDb<Post>(DB_NAME)
  return NextResponse.json(db.items)
}

// POST /api/posts — create a new post
export async function POST(request: Request) {
  const { title, content } = await request.json()

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const db = readDb<Post>(DB_NAME)

  const newPost: Post = {
    id: randomUUID(),
    title,
    content: content ?? '',
    createdAt: new Date().toISOString(),
  }

  db.items.push(newPost)
  writeDb(DB_NAME, db)

  return NextResponse.json(newPost, { status: 201 })
}