'use client'

import { useState } from 'react'

export default function GroupsTestPage() {
  const [title, setTitle] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([])

  function addLog(line: string) {
    const time = new Date().toLocaleTimeString()
    setLog((prev) => [`[${time}] ${line}`, ...prev])
  }

  async function createGroup() {
    if (!title.trim()) return
    setBusy(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      const data = await res.json()
      addLog(`POST /api/groups (title="${title.trim()}") → ${res.status} ${JSON.stringify(data)}`)
      if (res.ok) setTitle('')
    } catch (err) {
      addLog(`POST failed: ${String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function deleteGroup() {
    if (!deleteId.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/groups/${deleteId.trim()}`, { method: 'DELETE' })
      const data = await res.json()
      addLog(`DELETE /api/groups/${deleteId.trim()} → ${res.status} ${JSON.stringify(data)}`)
      if (res.ok) setDeleteId('')
    } catch (err) {
      addLog(`DELETE failed: ${String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function listMembers() {
    if (!groupId.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/groups/${groupId.trim()}/members`)
      const data = await res.json()
      addLog(`GET /api/groups/${groupId.trim()}/members → ${res.status} ${JSON.stringify(data)}`)
    } catch (err) {
      addLog(`GET members failed: ${String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function joinGroup() {
    if (!groupId.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/groups/${groupId.trim()}/members`, { method: 'POST' })
      const data = await res.json()
      addLog(`POST /api/groups/${groupId.trim()}/members → ${res.status} ${JSON.stringify(data)}`)
    } catch (err) {
      addLog(`POST members failed: ${String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function leaveGroup() {
    if (!groupId.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/groups/${groupId.trim()}/members`, { method: 'DELETE' })
      const data = await res.json()
      addLog(`DELETE /api/groups/${groupId.trim()}/members → ${res.status} ${JSON.stringify(data)}`)
    } catch (err) {
      addLog(`DELETE members failed: ${String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function listMine() {
    setBusy(true)
    try {
      const res = await fetch('/api/groups/mine')
      const data = await res.json()
      addLog(`GET /api/groups/mine → ${res.status} ${JSON.stringify(data)}`)
    } catch (err) {
      addLog(`GET mine failed: ${String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', maxWidth: 700, margin: '0 auto' }}>
      <h1>/api/groups action test</h1>
      <p style={{ color: '#666' }}>
        Fires actions only — check results in <code>npx prisma studio</code>.
      </p>

      <h2>Create</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New group title"
          style={{ flex: 1, padding: 8 }}
          onKeyDown={(e) => e.key === 'Enter' && createGroup()}
        />
        <button onClick={createGroup} disabled={busy || !title.trim()}>
          POST create
        </button>
      </div>

      <h2>Delete</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={deleteId}
          onChange={(e) => setDeleteId(e.target.value)}
          placeholder="Group id (from Prisma Studio)"
          style={{ flex: 1, padding: 8 }}
          onKeyDown={(e) => e.key === 'Enter' && deleteGroup()}
        />
        <button onClick={deleteGroup} disabled={busy || !deleteId.trim()}>
          DELETE
        </button>
      </div>

      <h2>Members</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="Group id (from Prisma Studio)"
          style={{ flex: 1, padding: 8 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={joinGroup} disabled={busy || !groupId.trim()}>
          POST join
        </button>
        <button onClick={leaveGroup} disabled={busy || !groupId.trim()}>
          DELETE leave
        </button>
        <button onClick={listMembers} disabled={busy || !groupId.trim()}>
          GET members
        </button>
      </div>

      <h2>Mine</h2>
      <div style={{ marginBottom: 24 }}>
        <button onClick={listMine} disabled={busy}>
          GET /api/groups/mine
        </button>
      </div>

      <h2>Log</h2>
      <pre style={{ background: '#111', color: '#0f0', padding: 12, overflowX: 'auto', minHeight: 100 }}>
        {log.length ? log.join('\n') : '(no actions yet)'}
      </pre>
    </div>
  )
}