import fs from 'fs'
import path from 'path'

export type DbShape<T> = {
  items: T[]
}

export function readDb<T>(name: string): DbShape<T> {
  const dbPath = path.join(process.cwd(), `./lib/db/${name}_db.json`)
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ items: [] }, null, 2))
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
}

export function writeDb<T>(name: string, data: DbShape<T>) {
  const dbPath = path.join(process.cwd(), `./lib/db/${name}_db.json`)
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}