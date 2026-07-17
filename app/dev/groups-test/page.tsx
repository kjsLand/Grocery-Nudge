'use client'

import { useState } from 'react'

type Group = {
  id: string
  title: string
  leaderId: string
  members: string[]
}

export default function GroupsTestPage() {
  const [groups, setGroups] = useState<Group[] | null>(null)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<unknown>(null)

  async function fetchGroups() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/groups')
      const data = await res.json()
      setLastResponse(data)
      setStatus(`GET /api/groups → ${res.status}`)
      if (res.ok) setGroups(data)
    } catch (err) {
      setStatus(`GET failed: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  async function createGroup() {
    if (!title.trim()) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      const data = await res.json()
      setLastResponse(data)
      setStatus(`POST /api/groups → ${res.status}`)
      if (res.ok) {
        setTitle('')
        fetchGroups() // re-pull straight from Postgres, never touches /mine
      }
    } catch (err) {
      setStatus(`POST failed: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', maxWidth: 700, margin: '0 auto' }}>
      <h1>/api/groups isolation test</h1>
      <p style={{ color: '#666' }}>
        Only calls <code>GET</code>/<code>POST /api/groups</code>. Doesn&apos;t touch{' '}
        <code>/api/groups/mine</code> or the real groups page.
      </p>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New group title"
          style={{ flex: 1, padding: 8 }}
          onKeyDown={(e) => e.key === 'Enter' && createGroup()}
        />
        <button onClick={createGroup} disabled={loading || !title.trim()}>
          POST create
        </button>
        <button onClick={fetchGroups} disabled={loading}>
          GET refresh
        </button>
      </div>

      {status && <p style={{ fontWeight: 'bold' }}>{status}</p>}

      <h2>Raw last response</h2>
      <pre style={{ background: '#111', color: '#0f0', padding: 12, overflowX: 'auto' }}>
        {lastResponse ? JSON.stringify(lastResponse, null, 2) : '(nothing yet — hit a button)'}
      </pre>

      <h2>Current list ({groups?.length ?? 0})</h2>
      <ul>
        {groups?.map((g) => (
          <li key={g.id}>
            <strong>{g.title}</strong> — id: {g.id} — leader: {g.leaderId} — members: [
            {g.members?.join(', ') ?? 'undefined!'}]
          </li>
        ))}
      </ul>
    </div>
  )
}