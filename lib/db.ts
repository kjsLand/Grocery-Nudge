// lib/db.ts
import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), './lib/db.json')

type Post = {
  id: number
  title: string
  content?: string
  createdAt: string
}

type DbShape = {
  posts: Post[]
}

export function readDb(): DbShape {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ posts: [] }, null, 2))
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
}

export function writeDb(data: DbShape) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}