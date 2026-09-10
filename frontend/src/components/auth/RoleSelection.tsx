type RoleSelectionProps = {
  onSelectTourist: () => void
  onSelectGuide: () => void
}

type RoleOption = {
  key: string
  icon: string
  title: string
  description: string
  status: string
  available: boolean
}

const roleOptions: RoleOption[] = [
  {
    key: 'tourist',
    icon: '🌍',
    title: 'Tourist',
    description: 'Discover Nepal, find local guides, transport and experiences.',
    status: 'AVAILABLE',
    available: true,
  },
  {
    key: 'guide',
    icon: '🧭',
    title: 'Local Guide',
    description: 'Share local knowledge and help travelers plan their route.',
    status: 'AVAILABLE',
    available: true,
  },
  {
    key: 'sherpa',
    icon: '⛰️',
    title: 'Trekking & Sherpa',
    description: 'Offer expedition support, routes and high-altitude guidance.',
    status: 'COMING SOON',
    available: false,
  },
  {
    key: 'transport',
    icon: '🚐',
    title: 'Transport Provider',
    description: 'Connect travelers with reliable local rides and routes.',
    status: 'COMING SOON',
    available: false,
  },
  {
    key: 'experience',
    icon: '✨',
    title: 'Experience Provider',
    description: 'Promote local experiences, adventures and cultural moments.',
    status: 'COMING SOON',
    available: false,
  },
]

export function RoleSelection({ onSelectTourist, onSelectGuide }: RoleSelectionProps) {
  return (
    <div className="auth-role-screen">
      <div className="auth-header-block">
        <h2 className="auth-heading">How are you joining us?</h2>
        <p className="auth-subtitle">Choose how you want to experience Nepal through YatraLink.</p>
      </div>

      <div className="auth-role-grid">
        <button
          type="button"
          className="auth-role-card auth-role-card--tourist"
          onClick={onSelectTourist}
        >
          <div className="auth-role-header">
            <span className="auth-role-icon">{roleOptions[0].icon}</span>
            <span className="auth-role-status auth-role-status--available">{roleOptions[0].status}</span>
          </div>

          <div className="auth-role-body">
            <h3>{roleOptions[0].title}</h3>
            <p>{roleOptions[0].description}</p>
          </div>

          <div className="auth-role-footer">
            <span>Continue</span>
            <span className="auth-role-arrow">→</span>
          </div>
        </button>

        <button
          type="button"
          className="auth-role-card auth-role-card--tourist"
          onClick={onSelectGuide}
        >
          <div className="auth-role-header">
            <span className="auth-role-icon">{roleOptions[1].icon}</span>
            <span className="auth-role-status auth-role-status--available">{roleOptions[1].status}</span>
          </div>

          <div className="auth-role-body">
            <h3>{roleOptions[1].title}</h3>
            <p>{roleOptions[1].description}</p>
          </div>

          <div className="auth-role-footer">
            <span>Continue</span>
            <span className="auth-role-arrow">→</span>
          </div>
        </button>

        {roleOptions.slice(2).map((role) => (
          <button
            key={role.key}
            type="button"
            className="auth-role-card auth-role-card--disabled"
            disabled
            aria-disabled="true"
            title="Coming soon"
          >
            <div className="auth-role-header">
              <span className="auth-role-icon auth-role-icon--muted">{role.icon}</span>
              <span className="auth-role-status auth-role-status--disabled">
                <span className="auth-role-prohibited">⛔</span>
                {role.status}
              </span>
            </div>

            <div className="auth-role-body">
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>

            <div className="auth-role-footer auth-role-footer--disabled">
              <span>Unavailable</span>
              <span className="auth-role-arrow">→</span>
            </div>
          </button>
        ))}

        <div aria-hidden="true" className="auth-role-spacer" />
      </div>
    </div>
  )
}
