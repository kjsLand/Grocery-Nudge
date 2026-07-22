// app/invites/page.tsx
'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from "next/navigation"
import { NudgeNavBar } from "../components/Nav"
import { colors, fonts, spacing, radii } from "@/app/src/theme/tokens"

// Matches the Invite model: groupId / senderId / receiverId, status is a
// plain string in the schema (not an enum), createdAt is stored as a string.
type Invite = {
  id: string
  groupId: string
  senderId: string
  receiverId: string
  status: string
  createdAt: string
}

type Group = {
  id: string
  title: string
  leaderId: string
}

type UserAccount = {
  id: string
  email: string
  createdAt: string
}

const STATUS_COLOR: Record<string, string> = {
  accepted: colors.amber,
  pending: colors.slate,
}

export default function Invites() {
  const router = useRouter()

  const [invites, setInvites] = useState<Invite[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [number, setNumber] = useState('')
  const [groupId, setGroupId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  const [, setUser] = useState<UserAccount | null>(null)
  const [, setProfileStatus] = useState<"loading" | "ready" | "error">("loading")

  // groupId -> title, so the list can show a name instead of a raw id
  const groupNameById = new Map(groups.map(g => [g.id, g.title]))

  function groupName(id: string) {
    return groupNameById.get(id) ?? id
  }

  async function loadInvites() {
    try {
      const response = await fetch('/api/invites')
      if (response.ok) {
        const data = await response.json()
        setInvites(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function loadGroups() {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
        // default the form's group select to the first group once loaded
        setGroupId(prev => prev || (data[0]?.id ?? ''))
      }
    } finally {
      setIsLoadingGroups(false)
    }
  }

  useEffect(() => {
    loadInvites()
    loadGroups()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          if (!cancelled) router.push("/src/login")
          return
        }
        const data = await response.json()
        if (!cancelled) {
          setUser(data)
          setProfileStatus("ready")
        }
      } catch {
        if (!cancelled) setProfileStatus("error")
      }
    }
    loadUser()
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!groupId) {
      setError('pick a group first')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, group_id: groupId }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error ?? "couldn't send that invite — try again")
        return
      }

      setNumber('')
      await loadInvites()
    } catch {
      setError('could not reach the server — try again in a moment')
    } finally {
      setIsSending(false)
    }
  }

  async function handleAccept(invite: Invite) {
    setPendingActionId(invite.id)
    try {
      const response = await fetch(`/api/groups/${invite.groupId}/members`, {
        method: 'POST',
      })
      if (response.ok) {
        setInvites(prev =>
          prev.map(inv => (inv.id === invite.id ? { ...inv, status: 'accepted' } : inv))
        )
      }
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleDelete(id: string) {
    setPendingActionId(id)
    try {
      const response = await fetch(`/api/invites/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setInvites(prev => prev.filter(inv => inv.id !== id))
      }
    } finally {
      setPendingActionId(null)
    }
  }

  const labelStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: fonts.body,
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: colors.amber,
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    color: colors.amber,
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${colors.line}`,
    borderRadius: 0,
    padding: `${spacing.sm} 2px`,
    outline: "none",
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.paper }}>
      <NudgeNavBar />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: `${spacing.xxl} ${spacing.lg}` }}>
        <p
          style={{
            margin: 0,
            marginBottom: spacing.xs,
            fontFamily: fonts.body,
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: colors.amber,
          }}
        >
          Groups
        </p>
        <h1
          style={{
            margin: 0,
            marginBottom: spacing.xl,
            fontFamily: fonts.display,
            fontSize: "2.25rem",
            color: colors.mutedPlaceholder,
          }}
        >
          Invites
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: spacing.xxl }}>
          {/* Send panel */}
          <div
            style={{
              backgroundColor: colors.paper,
              border: `1px solid ${colors.line}`,
              borderRadius: radii.lg,
              padding: spacing.xl,
              height: "fit-content",
            }}
          >
            <p style={{ ...labelStyle, marginBottom: spacing.lg }}>Send one</p>

            <form onSubmit={handleSend} noValidate style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
              <label style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                <span style={labelStyle}>Group</span>
                {isLoadingGroups ? (
                  <span style={{ fontFamily: fonts.body, fontSize: "0.85rem", color: colors.mutedPlaceholder }}>
                    loading groups…
                  </span>
                ) : groups.length === 0 ? (
                  <span style={{ fontFamily: fonts.body, fontSize: "0.85rem", color: colors.mutedPlaceholder }}>
                    no groups yet — make one first
                  </span>
                ) : (
                  <select
                    name="group_id"
                    required
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.title}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                <span style={labelStyle}>Phone Number</span>
                <input
                  name="number"
                  type="tel"
                  required
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="(555) 555-5555"
                  style={inputStyle}
                />
              </label>

              {error && (
                <p style={{ margin: 0, fontFamily: fonts.body, fontSize: "0.8rem", color: colors.error }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSending || groups.length === 0}
                style={{
                  alignSelf: "flex-start",
                  fontFamily: fonts.body,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: colors.amber,
                  background: "transparent",
                  border: `1px solid ${colors.amber}`,
                  borderRadius: radii.md,
                  padding: `${spacing.sm} ${spacing.lg}`,
                  cursor: isSending || groups.length === 0 ? "not-allowed" : "pointer",
                  opacity: isSending || groups.length === 0 ? 0.5 : 1,
                }}
              >
                {isSending ? 'Sending…' : 'Send invite'}
              </button>
            </form>
          </div>

          {/* List panel */}
          <div
            style={{
              backgroundColor: colors.paper,
              border: `1px solid ${colors.line}`,
              borderRadius: radii.lg,
              overflow: "hidden",
            }}
          >
            {isLoading && (
              <div style={{ padding: spacing.xl }}>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    style={{
                      height: "1rem",
                      width: i % 2 === 0 ? "60%" : "40%",
                      backgroundColor: colors.line,
                      borderRadius: radii.sm,
                      marginBottom: i === 2 ? 0 : spacing.lg,
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
            )}

            {!isLoading && invites.length === 0 && (
              <p
                style={{
                  margin: 0,
                  padding: spacing.xl,
                  fontFamily: fonts.body,
                  fontSize: "0.875rem",
                  fontStyle: "italic",
                  color: colors.mutedPlaceholder,
                }}
              >
                No invites yet — send one on the left.
              </p>
            )}

            {!isLoading && invites.length > 0 && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {invites.map((invite, i) => (
                  <li
                    key={invite.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing.md,
                      padding: `${spacing.md} ${spacing.xl}`,
                      borderBottom: i === invites.length - 1 ? "none" : `1px solid ${colors.line}`,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                      {/* The Invite model only stores receiverId, not a phone
                          number. Showing the id for now — if /api/invites
                          starts returning the receiver's phone/email (e.g.
                          via a Prisma `include`), swap this for that. */}
                      <span style={{ fontFamily: fonts.body, fontSize: "0.9rem", color: colors.paper }}>
                        invited: {invite.receiverId}
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.body,
                          fontSize: "0.7rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: STATUS_COLOR[invite.status] ?? colors.slate,
                          width: "fit-content",
                        }}
                      >
                        {invite.status}
                      </span>
                      <span style={{ fontFamily: fonts.body, fontSize: "0.75rem", color: colors.mutedPlaceholder }}>
                        group: {groupName(invite.groupId)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: spacing.md, flexShrink: 0 }}>
                      {invite.status !== 'accepted' && (
                        <button
                          type="button"
                          disabled={pendingActionId === invite.id}
                          onClick={() => handleAccept(invite)}
                          style={{
                            fontFamily: fonts.body,
                            fontSize: "0.7rem",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            background: "none",
                            border: "none",
                            color: colors.amber,
                            cursor: pendingActionId === invite.id ? "not-allowed" : "pointer",
                            opacity: pendingActionId === invite.id ? 0.4 : 1,
                            padding: 0,
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          accept
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={pendingActionId === invite.id}
                        onClick={() => handleDelete(invite.id)}
                        style={{
                          fontFamily: fonts.body,
                          fontSize: "0.7rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          background: "none",
                          border: "none",
                          color: colors.error,
                          cursor: pendingActionId === invite.id ? "not-allowed" : "pointer",
                          opacity: pendingActionId === invite.id ? 0.4 : 1,
                          padding: 0,
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}