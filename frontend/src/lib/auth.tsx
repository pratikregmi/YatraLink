import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  getMe,
  login as loginRequest,
  signup as signupRequest,
  type LoginPayload,
  type SignupPayload,
} from './api/auth'
import type { UserResponse } from './api'

const TOKEN_STORAGE_KEY = 'yatra-link-token'

type AuthContextValue = {
  user: UserResponse | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginPayload) => Promise<UserResponse>
  signup: (payload: SignupPayload) => Promise<UserResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function getStoredToken() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }
}

export function clearStoredToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const profile = await getMe(token)
      setUser(profile)
    } catch {
      clearStoredToken()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = getStoredToken()

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    fetchCurrentUser(token).finally(() => setLoading(false))
  }, [fetchCurrentUser])

  const login = useCallback(async (payload: LoginPayload) => {
    const authResponse = await loginRequest(payload)
    setStoredToken(authResponse.access_token)
    const profile = await getMe(authResponse.access_token)
    setUser(profile)
    return profile
  }, [])

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await signupRequest(payload)
      const profile = await login({
        email: payload.email,
        password: payload.password,
        role: payload.role,
      })
      return profile
    },
    [login],
  )

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      signup,
      logout,
    }),
    [loading, login, logout, signup, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
