import { type ChangeEvent, type FormEvent } from 'react'

export type AuthMode = 'signup' | 'login'

type TouristAuthProps = {
  mode: AuthMode
  selectedRole: 'tourist' | 'guide'
  onModeChange: (mode: AuthMode) => void
  onBack: () => void
  form: {
    full_name: string
    email: string
    password: string
  }
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error: string
  loading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function TouristAuth({
  mode,
  selectedRole,
  onModeChange,
  onBack,
  form,
  onChange,
  error,
  loading,
  onSubmit,
}: TouristAuthProps) {
  const roleLabel = selectedRole === 'guide' ? 'LOCAL GUIDE' : 'TOURIST'
  const roleIcon = selectedRole === 'guide' ? '🧭' : '🌍'

  return (
    <div className="auth-form-screen">
      <div className="auth-header-block">
        <span className="auth-badge auth-tourist-badge">{roleIcon} {roleLabel}</span>
        <h2 className="auth-heading">Welcome to YatraLink</h2>
        <p className="auth-subtitle">Continue your journey through Nepal.</p>
      </div>

      <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === 'signup' ? 'auth-toggle-button auth-toggle-button--active' : 'auth-toggle-button'}
          onClick={() => onModeChange('signup')}
        >
          Sign up
        </button>
        <button
          type="button"
          className={mode === 'login' ? 'auth-toggle-button auth-toggle-button--active' : 'auth-toggle-button'}
          onClick={() => onModeChange('login')}
        >
          Log in
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {mode === 'signup' && (
          <label className="auth-field">
            <span>Full name</span>
            <input
              name="full_name"
              value={form.full_name}
              onChange={onChange}
              placeholder="Your name"
              required
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email address</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter a secure password"
            required
          />
        </label>

        {error && <p className="auth-form-error">{error}</p>}

        <button type="submit" className="auth-submit-button" disabled={loading}>
          {loading
            ? 'Please wait...'
            : mode === 'signup'
              ? `Create ${selectedRole === 'guide' ? 'Local Guide' : 'Tourist'} Account`
              : `Log in as ${selectedRole === 'guide' ? 'Local Guide' : 'Tourist'}`}
        </button>
      </form>

      <button type="button" className="auth-back-link" onClick={onBack}>
        ← Choose another option
      </button>
    </div>
  )
}
