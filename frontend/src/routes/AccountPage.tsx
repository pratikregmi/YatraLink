import { useAuth } from '../lib/auth'

type AccountPageProps = {
  navigate: (path: string) => void
}

export function AccountPage({ navigate }: AccountPageProps) {
  const { user, logout } = useAuth()

  if (!user) {
    navigate('/')
    return null
  }

  const isGuide = user.role === 'LOCAL_GUIDE'
  const accountLabel = isGuide ? 'Local Guide profile' : 'Tourist profile'
  const roleDescription = isGuide
    ? 'Your local knowledge helps travelers experience Nepal with confidence.'
    : 'Your trusted starting point for discovering Nepal and its local connections.'

  return (
    <div className="auth-route-shell">
      <div className="auth-route-card account-card">
        <span className="eyebrow">{accountLabel}</span>
        <h1>Welcome, {user.full_name}</h1>
        <p className="account-intro">{roleDescription}</p>

        <div className="account-summary">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Account type:</strong> {isGuide ? 'Local guide' : 'Tourist'}
          </p>
          <p>
            <strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
