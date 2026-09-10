import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'

import { getCurrentUser, loginUser, signupUser, type UserResponse } from '../../lib/api'
import './AuthModal.css'
import { RoleSelection } from './RoleSelection'
import { TouristAuth, type AuthMode } from './TouristAuth'

type AuthView = 'role' | 'signup' | 'login'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onAuthenticated: (user: UserResponse) => void
  onLogout: () => void
  user: UserResponse | null
}

const initialForm = {
  full_name: '',
  email: '',
  password: '',
}

export function AuthModal({ isOpen, onClose, onAuthenticated, onLogout, user }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('role')
  const [mode, setMode] = useState<AuthMode>('signup')
  const [selectedRole, setSelectedRole] = useState<'tourist' | 'guide'>('tourist')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setView('role')
      setMode('signup')
      setSelectedRole('tourist')
      setForm(initialForm)
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const selectedRoleValue = selectedRole === 'guide' ? 'LOCAL_GUIDE' : 'TOURIST'

      if (mode === 'signup') {
        await signupUser({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password,
          role: selectedRoleValue,
        })

        const loginResponse = await loginUser({
          email: form.email,
          password: form.password,
          role: selectedRoleValue,
        })

        localStorage.setItem('yatra-link-token', loginResponse.access_token)
        const profile = await getCurrentUser(loginResponse.access_token)
        onAuthenticated(profile)
        setForm(initialForm)
        setView('role')
        onClose()
        return
      }

      const loginResponse = await loginUser({
        email: form.email,
        password: form.password,
        role: selectedRoleValue,
      })

      localStorage.setItem('yatra-link-token', loginResponse.access_token)
      const profile = await getCurrentUser(loginResponse.access_token)
      onAuthenticated(profile)
      setForm(initialForm)
      setView('role')
      onClose()
    } catch (submissionError) {
      const message =
        submissionError instanceof Error && submissionError.message
          ? submissionError.message
          : 'Unable to complete authentication.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const currentScreen = useMemo(() => {
    if (view === 'role') {
      return (
        <RoleSelection
          onSelectTourist={() => {
            setSelectedRole('tourist')
            setView('signup')
            setMode('signup')
            setError('')
          }}
          onSelectGuide={() => {
            setSelectedRole('guide')
            setView('signup')
            setMode('signup')
            setError('')
          }}
        />
      )
    }

    return (
      <TouristAuth
        mode={mode}
        selectedRole={selectedRole}
        onModeChange={(nextMode) => {
          setMode(nextMode)
          setError('')
          setView(nextMode)
        }}
        onBack={() => {
          setError('')
          setSelectedRole('tourist')
          setView('role')
        }}
        form={form}
        onChange={handleInputChange}
        error={error}
        loading={loading}
        onSubmit={handleAuthSubmit}
      />
    )
  }, [error, form, loading, mode, onClose, selectedRole, view])

  if (!isOpen) {
    return null
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button type="button" className="auth-close-button" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        {user ? (
          <div className="auth-user-panel">
            <div className="auth-user-pill">{user.role}</div>
            <h3>{user.full_name}</h3>
            <p>{user.email}</p>
            <button type="button" className="auth-logout-button" onClick={onLogout}>
              Log out
            </button>
          </div>
        ) : (
          currentScreen
        )}
      </div>
    </div>
  )
}
