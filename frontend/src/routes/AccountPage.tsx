import { useAuth } from '../lib/auth'

type AccountPageProps = {
  navigate: (path: string) => void
}

export function AccountPage({ navigate }: AccountPageProps) {
  const { user, logout } = useAuth()

  if (!user) {
    navigate('/login')
    return null
  }

  const accountLabel = user.role === 'LOCAL_GUIDE' ? 'Local Guide account' : 'Tourist account'

  return (
    <div className="auth-route-shell">
      <div className="auth-route-card account-card">
        <span className="eyebrow">{accountLabel}</span>
        <h1>Welcome, {user.full_name}</h1>

        <div className="account-summary">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
