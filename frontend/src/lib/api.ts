import axios, { type AxiosRequestConfig } from 'axios'

export type UserResponse = {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}

const ACCESS_TOKEN_STORAGE_KEY = 'yatra-link-access-token'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

let inMemoryAccessToken: string | null = null

function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return inMemoryAccessToken
  }

  return window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? inMemoryAccessToken
}

export function setStoredAccessToken(token: string | null) {
  inMemoryAccessToken = token

  if (typeof window !== 'undefined') {
    if (token) {
      window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
      return
    }

    window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  }
}

export function clearStoredAccessToken() {
  setStoredAccessToken(null)
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback
  }

  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: { msg?: string }) => item.msg)
      .filter(Boolean)
      .map((message) => message!.replace(/^Value error,\s*/i, ''))

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  if (typeof detail === 'string' && detail) {
    return detail
  }

  return fallback
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()

  if (!token) {
    return config
  }

  config.headers = axios.AxiosHeaders.from({
    ...(config.headers ?? {}),
    Authorization: `Bearer ${token}`,
  })

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!error.response || !originalRequest || originalRequest._retry || error.response.status !== 401) {
      return Promise.reject(error)
    }

    try {
      const refreshResponse = await apiClient.post('/auth/refresh')
      const nextAccessToken = refreshResponse.data?.access_token as string | undefined

      if (!nextAccessToken) {
        throw new Error('Refresh token response missing access token')
      }

      setStoredAccessToken(nextAccessToken)
      originalRequest._retry = true
      originalRequest.headers = axios.AxiosHeaders.from({
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${nextAccessToken}`,
      })

      return apiClient(originalRequest)
    } catch (refreshError) {
      setStoredAccessToken(null)

      if (typeof window !== 'undefined') {
        window.location.assign('/login?reason=session_expired')
      }

      return Promise.reject(refreshError)
    }
  },
)

export async function refreshAccessToken() {
  const response = await apiClient.post('/auth/refresh')
  const accessToken = response.data?.access_token as string | undefined

  if (!accessToken) {
    throw new Error('No access token returned from refresh endpoint')
  }

  setStoredAccessToken(accessToken)
  return accessToken
}

export async function getHealthStatus() {
  const response = await apiClient.get('/health')
  return response.data
}

export async function signupTourist(payload: {
  full_name: string
  email: string
  password: string
  password_confirmation: string
  role?: 'TOURIST' | 'LOCAL_GUIDE'
}) {
  const role = payload.role ?? 'TOURIST'
  const endpoint = role === 'LOCAL_GUIDE' ? '/auth/guide/signup' : '/auth/tourist/signup'
  const response = await apiClient.post(endpoint, payload)
  return response.data as UserResponse
}

export async function loginTourist(payload: {
  email: string
  password: string
  role?: 'TOURIST' | 'LOCAL_GUIDE'
}) {
  const role = payload.role ?? 'TOURIST'
  const endpoint = role === 'LOCAL_GUIDE' ? '/auth/guide/login' : '/auth/tourist/login'
  const response = await apiClient.post(endpoint, payload, { withCredentials: true })
  setStoredAccessToken(response.data.access_token)
  return response.data as { access_token: string; token_type: string }
}

export async function logoutUser() {
  try {
    await apiClient.post('/auth/logout', {}, { withCredentials: true })
  } finally {
    clearStoredAccessToken()
  }
}

export async function getCurrentUser(token: string) {
  const response = await apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data as UserResponse
}

export async function signupUser(payload: {
  full_name: string
  email: string
  password: string
  password_confirmation?: string
  role?: 'TOURIST' | 'LOCAL_GUIDE'
}) {
  return signupTourist({
    full_name: payload.full_name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password_confirmation ?? payload.password,
    role: payload.role,
  })
}

export async function loginUser(payload: {
  email: string
  password: string
  role?: 'TOURIST' | 'LOCAL_GUIDE'
}) {
  return loginTourist(payload)
}
