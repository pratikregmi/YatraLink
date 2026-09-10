import { useState, type ChangeEvent, type FormEvent } from 'react'

import { useAuth } from '../lib/auth'

const initialForm = {
  email: '',
  password: '',
}

type LoginPageProps = {
  navigate: (path: string) => void
}

export function LoginPage({ navigate }: LoginPageProps) {
  const { login } = useAuth()
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

    try {
      await login(form)
      navigate('/account')
    } catch (submissionError) {
      const message =
        submissionError instanceof Error && submissionError.message
          ? submissionError.message
          : 'Unable to log in. Please check your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-route-shell">
      <div className="auth-route-card">
        <div className="auth-route-header">
          <span className="eyebrow">Welcome back</span>
          <h1>Log in to YatraLink</h1>
        </div>

        <form className="auth-route-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <p className="auth-route-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-route-footer">
          Don&apos;t have an account?{' '}
          <button type="button" className="link-button" onClick={() => navigate('/signup')}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
