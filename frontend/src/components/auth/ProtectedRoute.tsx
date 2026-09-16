import type { ReactNode } from 'react'

import { useAuth } from '../../lib/auth'

type ProtectedRouteProps = {
  children: ReactNode
  navigate: (path: string) => void
}

export function ProtectedRoute({ children, navigate }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return children
}