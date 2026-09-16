import { useState, type ChangeEvent, type FormEvent } from 'react'

import { getApiErrorMessage } from '../lib/api'
import { useAuth } from '../lib/auth'

const initialForm = {
  full_name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

type SignupPageProps = {
  navigate: (path: string) => void
}

export function SignupPage({ navigate }: SignupPageProps) {
  const { signup } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      if (form.password !== form.password_confirmation) {
        setError('Passwords do not match.')
        return
      }

      await signup(form)
      navigate('/account')
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, 'Unable to create account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-route-shell">
      <div className="auth-route-card">
        <div className="auth-route-header">
          <span className="eyebrow">Start your journey</span>
          <h1>Create your tourist account</h1>
        </div>

        <form className="auth-route-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
          </label>

            <p className="auth-password-hint">
              Use at least 8 characters, including one uppercase letter, one number, and one special
              character.
            </p>

          <label>
            Confirm password
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </label>

          {error && <p className="auth-route-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-route-footer">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={() => navigate('/login')}>
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
