'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Caveat, Source_Serif_4, Courier_Prime } from 'next/font/google'

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

type User = {
  id: string
  email: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          if (!cancelled) router.push('/login')
          return
        }
        const data = await response.json()
        if (!cancelled) {
          setUser(data)
          setStatus('ready')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
    }
  }

  const joined = user
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <main className={`${caveat.variable} ${sourceSerif.variable} ${courierPrime.variable} wrap`}>
      <div className="page">
        <div className="margin-rule" />
        <div className="content">
          <p className="eyebrow">— private notebook —</p>

          {status === 'loading' && <p className="status-text">opening your notebook…</p>}

          {status === 'error' && (
            <>
              <h1 className="title">Something went wrong</h1>
              <p className="sub">Couldn&apos;t reach the server just now.</p>
              <button type="button" className="stamp" onClick={() => window.location.reload()}>
                Try again
              </button>
            </>
          )}

          {status === 'ready' && user && (
            <>
              <h1 className="title">Your page</h1>
              <p className="sub">This entry belongs to you alone.</p>

              <dl className="details">
                <div className="detail-row">
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div className="detail-row">
                  <dt>Member since</dt>
                  <dd>{joined}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="stamp"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'closing…' : 'Sign out'}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .wrap {
          --paper: #ede6d3;
          --paper-shadow: #dcd3b8;
          --ink: #22283b;
          --graphite: #6b6458;
          --wax-red: #b33a3a;
          --rule-blue: #a9bbd1;

          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: var(--paper-shadow);
          background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 60%);
        }

        .page {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--paper);
          box-shadow: 0 18px 40px rgba(34, 40, 59, 0.18), 0 2px 0 rgba(34, 40, 59, 0.05);
          clip-path: polygon(
            0% 4px, 5% 0px, 11% 5px, 17% 1px, 23% 6px, 29% 0px, 35% 4px,
            41% 1px, 47% 5px, 53% 0px, 59% 6px, 65% 1px, 71% 5px,
            77% 0px, 83% 6px, 89% 1px, 95% 5px, 100% 0px,
            100% 100%, 0% 100%
          );
        }

        .margin-rule {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 44px;
          width: 1px;
          background: var(--wax-red);
          opacity: 0.55;
        }

        .content {
          padding: 48px 40px 40px 68px;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 35px,
            var(--rule-blue) 36px
          );
          background-position: 0 96px;
          min-height: 280px;
        }

        .eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--graphite);
          margin: 0 0 4px;
        }

        .status-text {
          font-family: var(--font-serif);
          font-size: 15px;
          color: var(--graphite);
          margin: 12px 0 0;
        }

        .title {
          font-family: var(--font-caveat);
          font-weight: 700;
          font-size: 52px;
          line-height: 1;
          color: var(--ink);
          margin: 0 0 6px;
          transform: rotate(-1deg);
        }

        .sub {
          font-family: var(--font-serif);
          font-size: 15px;
          color: var(--graphite);
          margin: 0 0 28px;
        }

        .details {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin: 0 0 32px;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail-row dt {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--graphite);
        }

        .detail-row dd {
          font-family: var(--font-serif);
          font-size: 17px;
          color: var(--ink);
          margin: 0;
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

        @media (prefers-reduced-motion: reduce) {
          .stamp {
            transition: none;
          }
        }

        @media (max-width: 420px) {
          .content {
            padding: 40px 24px 32px 48px;
          }
          .margin-rule {
            left: 28px;
          }
          .title {
            font-size: 42px;
          }
        }
      `}</style>
    </main>
  )
}