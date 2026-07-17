// app/invites/page.tsx
'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Caveat, Source_Serif_4, Courier_Prime } from 'next/font/google'
import { NudgeNavBar } from "../components/Nav"
import { useRouter } from "next/navigation";


const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-caveat',
})
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-serif',
})
const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

type Invite = {
  id: string
  group_id: string
  number: string
  invitedBy: string
  status: 'pending' | 'accepted'
  createdAt: string
}

type UserAccount = {
  id: string;
  email: string;
  createdAt: string;
};

export default function Invites() {
  const router = useRouter();

  const [invites, setInvites] = useState<Invite[]>([])
  const [number, setNumber] = useState('')
  const [groupId, setGroupId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  const [user, setUser] = useState<UserAccount | null>(null);
  const [profileStatus, setProfileStatus] = useState<"loading" | "ready" | "error">("loading");

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

  useEffect(() => {
    loadInvites()
  }, [])

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (!cancelled) router.push("/src/login");
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          setUser(data);
          setProfileStatus("ready");
        }
      } catch {
        if (!cancelled) setProfileStatus("error");
      }
    }
    loadUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
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
      const response = await fetch(`/api/groups/${invite.group_id}/members`, {
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

  return (
    <div className={`${caveat.variable} ${sourceSerif.variable} ${courierPrime.variable} shell`}>
      <NudgeNavBar />

      <main className="wrap">
        <div className="margin-rule" />
        <div className="content">
          <header className="page-head">
            <p className="eyebrow">— private notebook —</p>
            <h1 className="title">Invites</h1>
          </header>

          <div className="layout">
            <section className="panel send-panel">
              <p className="eyebrow">— send one —</p>
              <form onSubmit={handleSend} className="form" noValidate>
                <label className="field">
                  <span className="label">Group ID</span>
                  <input
                    name="group_id"
                    type="text"
                    required
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    placeholder="which group is this for?"
                  />
                </label>

                <label className="field">
                  <span className="label">Phone Number</span>
                  <input
                    name="number"
                    type="tel"
                    required
                    value={number}
                    onChange={e => setNumber(e.target.value)}
                    placeholder="(555) 555-5555"
                  />
                </label>

                {error && <p className="error">{error}</p>}

                <button type="submit" className="stamp" disabled={isSending}>
                  {isSending ? 'sending…' : 'Send invite'}
                </button>
              </form>
            </section>

            <section className="panel list-panel">
              <p className="eyebrow">— on the list —</p>

              {isLoading && <p className="empty">fetching invites…</p>}

              {!isLoading && invites.length === 0 && (
                <p className="empty">no invites yet — send one on the left</p>
              )}

              {!isLoading && invites.length > 0 && (
                <ul className="list">
                  {invites.map(invite => (
                    <li key={invite.id} className="item">
                      <div className="item-info">
                        <span className="item-number">{invite.number}</span>
                        <span className={`item-status status-${invite.status}`}>
                          {invite.status}
                        </span>
                        <span className="item-group">group: {invite.group_id}</span>
                      </div>
                      <div className="item-actions">
                        {invite.status !== 'accepted' && (
                          <button
                            type="button"
                            className="link-btn accept"
                            disabled={pendingActionId === invite.id}
                            onClick={() => handleAccept(invite)}
                          >
                            accept
                          </button>
                        )}
                        <button
                          type="button"
                          className="link-btn delete"
                          disabled={pendingActionId === invite.id}
                          onClick={() => handleDelete(invite.id)}
                        >
                          delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        .shell {
          --paper: #ede6d3;
          --paper-shadow: #dcd3b8;
          --ink: #22283b;
          --graphite: #6b6458;
          --wax-red: #b33a3a;
          --wax-green: #4c7a52;
          --rule-blue: #a9bbd1;

          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--paper-shadow);
        }

        .wrap {
          position: relative;
          flex: 1 1 auto;
          width: 100%;
          background: var(--paper);
          background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 60%);
        }

        .margin-rule {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 56px;
          width: 1px;
          background: var(--wax-red);
          opacity: 0.55;
        }

        .content {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 40px 64px 80px;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 35px,
            var(--rule-blue) 36px
          );
          background-position: 0 116px;
        }

        .page-head {
          margin-bottom: 32px;
        }

        .eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--graphite);
          margin: 0 0 4px;
        }

        .title {
          font-family: var(--font-caveat);
          font-weight: 700;
          font-size: 56px;
          line-height: 1;
          color: var(--ink);
          margin: 0;
          transform: rotate(-1deg);
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(260px, 340px) 1fr;
          gap: 56px;
          align-items: start;
        }

        .panel {
          min-width: 0;
        }

        .send-panel {
          position: sticky;
          top: 24px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--graphite);
        }

        .field input {
          font-family: var(--font-serif);
          font-size: 17px;
          color: var(--ink);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(34, 40, 59, 0.35);
          padding: 4px 2px 8px;
          outline: none;
        }

        .field input::placeholder {
          color: rgba(34, 40, 59, 0.35);
        }

        .field input:focus {
          border-bottom: 1px solid var(--wax-red);
        }

        .field input:focus-visible {
          outline: 2px solid var(--wax-red);
          outline-offset: 3px;
        }

        .error {
          font-family: var(--font-caveat);
          font-size: 19px;
          color: var(--wax-red);
          margin: -8px 0 0;
        }

        .stamp {
          align-self: flex-start;
          margin-top: 4px;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--wax-red);
          background: transparent;
          border: 3px double var(--wax-red);
          border-radius: 44% 42% 40% 45% / 50% 45% 50% 45%;
          padding: 10px 26px;
          cursor: pointer;
          transform: rotate(-3deg);
          transition: background 0.15s ease, color 0.15s ease;
        }

        .stamp:hover:not(:disabled) {
          background: var(--wax-red);
          color: var(--paper);
        }

        .stamp:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 14px;
          color: var(--graphite);
          margin: 16px 0 0;
        }

        .list {
          list-style: none;
          margin: 16px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 10px;
          border-bottom: 1px dashed rgba(34, 40, 59, 0.25);
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-number {
          font-family: var(--font-serif);
          font-size: 16px;
          color: var(--ink);
        }

        .item-status {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          width: fit-content;
        }

        .status-pending {
          color: var(--graphite);
        }

        .status-accepted {
          color: var(--wax-green);
        }

        .item-group {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--graphite);
        }

        .item-actions {
          display: flex;
          gap: 14px;
          flex-shrink: 0;
        }

        .link-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-decoration-style: wavy;
          text-underline-offset: 3px;
        }

        .link-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .link-btn.accept {
          color: var(--wax-green);
        }

        .link-btn.delete {
          color: var(--wax-red);
        }

        @media (max-width: 780px) {
          .layout {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .send-panel {
            position: static;
          }
        }

        @media (max-width: 480px) {
          .content {
            padding: 36px 20px 48px 44px;
          }
          .margin-rule {
            left: 24px;
          }
          .title {
            font-size: 42px;
          }
          .item {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  )
}