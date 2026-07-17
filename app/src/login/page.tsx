'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Caveat, Source_Serif_4, Courier_Prime } from 'next/font/google'
import { NudgeNavBar } from "../components/Nav"

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

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push('/groups')
        return
      }

      const data = await response.json().catch(() => null)
      setError(data?.message ?? "that didn't work — check your details and try again")
    } catch {
      setError('could not reach the server — try again in a moment')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSignUpClick() {
    router.push('/register')
  }

  return (
    <main>
      <NudgeNavBar landing_only={true} />
      <div>
        <div className="margin-rule" />
        <div className="content">
          <p className="eyebrow">— private notebook —</p>
          <h1 className="title">Sign in</h1>
          <p className="sub">Pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="form" noValidate>
            <label className="field">
              <span className="label">Email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <input name="password" type="password" required autoComplete="current-password" />
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="stamp" disabled={isSubmitting}>
              {isSubmitting ? 'checking…' : 'Enter'}
            </button>
          </form>

          <a href="#" className="forgot">
            forgot your password?
          </a>

          <button type="button" onClick={handleSignUpClick} className="signup-link">
            Don&apos;t have an account? Sign up
          </button>
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

        .form {
          display: flex;
          flex-direction: column;
          gap: 24px;
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

        .forgot {
          display: inline-block;
          margin-top: 28px;
          font-family: var(--font-serif);
          font-size: 13px;
          color: var(--graphite);
          text-decoration: underline;
          text-decoration-style: wavy;
          text-underline-offset: 3px;
        }

        .signup-link {
          display: block;
          margin-top: 12px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: var(--font-serif);
          font-size: 13px;
          color: var(--graphite);
          text-decoration: underline;
          text-decoration-style: wavy;
          text-underline-offset: 3px;
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