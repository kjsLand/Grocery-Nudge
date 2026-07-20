'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { NudgeNavBar } from "../../components/Nav"
import TextField from "../../components/ui/FieldInput"
import Panel from "../../components/ui/Panel"
import Button from "../../components/ui/Button"

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
        router.push('/src/groups')
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
    router.push('/src/auth/register')
  }

  return (
    <main>
      <NudgeNavBar landing_only={true} />

      <Panel eyebrow="— First on the list, enter your info —" title="Sign in">
        <form onSubmit={handleSubmit} className="form" noValidate>
          <TextField label="Email" name="email" type="email" required autoComplete="email" />
          <TextField
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            labelAction={<a href="/reset" className="signup-link">Forgot?</a>}
            endAdornment={<button type="button">👁️</button>}
          />

          {error && <p className="error">{error}</p>}

          <Button 
            type="submit" 
            className="stamp" 
            disabled={isSubmitting} 
            children={<span>Submit</span>}
          />
        </form>

        <button type="button" onClick={handleSignUpClick} className="signup-link">
          Don&apos;t have an account? Sign up
        </button>
      </Panel>

      <style jsx>{`
        .form {
          padding: 1rem 0rem 0rem 0rem;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .signup-link {
          display: block;
          margin-top: 20px;
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
      `}</style>
    </main>
  )
}