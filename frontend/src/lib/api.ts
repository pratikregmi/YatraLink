import axios from 'axios'

export type UserResponse = {
  id: number
  email: string
  full_name: string
  role: string
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

export async function signupUser(payload: { full_name: string; email: string; password: string }) {
  const response = await apiClient.post('/auth/signup', payload)
  return response.data as UserResponse
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await apiClient.post('/auth/login', payload)
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
