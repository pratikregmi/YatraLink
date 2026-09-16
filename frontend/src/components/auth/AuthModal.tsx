/* oxlint-disable react/set-state-in-effect */

import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'

import { useAuth } from '../../lib/auth'
import { getApiErrorMessage, type UserResponse } from '../../lib/api'
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
  password_confirmation: '',
}

export function AuthModal({ isOpen, onClose, onAuthenticated, onLogout, user }: AuthModalProps) {
  const { login, signup } = useAuth()
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
        if (form.password !== form.password_confirmation) {
          setError('Passwords do not match.')
          return
        }

        const profile = await signup({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          role: selectedRoleValue,
        })
        onAuthenticated(profile)
        setForm(initialForm)
        setView('role')
        onClose()
        return
      }

      const profile = await login({
        email: form.email,
        password: form.password,
        role: selectedRoleValue,
      })
      onAuthenticated(profile)
      setForm(initialForm)
      setView('role')
      onClose()
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, 'Unable to complete authentication.'))
    } finally {
      setLoading(false)
    }
  }

  const currentScreen = (() => {
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
  })()

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
