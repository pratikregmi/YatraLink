import axios from 'axios'

export type UserResponse = {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
  const response = await apiClient.post(endpoint, payload)
  return response.data as { access_token: string; token_type: string }
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
