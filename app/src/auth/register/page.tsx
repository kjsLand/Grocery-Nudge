'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { NudgeNavBar } from "../../components/Nav"
import Panel from "../../components/ui/Panel"
import TextField from "../../components/ui/FieldInput"
import Button from "../../components/ui/Button"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const phone = formData.get('phone')
    const password = formData.get('password')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password }),
      })

      if (response.ok) {
        router.push('/src/auth/login')
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
    router.push('/src/auth/login')
  }

  return (
    <main>
      <NudgeNavBar landing_only={true} />
      <Panel 
        eyebrow="— private notebook —" 
        title="Create an Account!" 
      >
        <form onSubmit={handleSubmit} className="form" noValidate>
          <TextField label="Email" name="email" type="email" required autoComplete="email" />
          <TextField label="Phone Number" name="phone" type="tel" required autoComplete="tel" placeholder="(555) 555-5555"/>
          <TextField
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            endAdornment={<button type="button">👁️</button>}
          />
          {error && <p className="error">{error}</p>}
          <Button 
            type="submit" 
            className="stamp" 
            disabled={isSubmitting} 
            children={<span>Submit</span>}
          />
          <button type="button" onClick={handleSignUpClick} className="signup-link">
              Already have an account?
          </button>
        </form>
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