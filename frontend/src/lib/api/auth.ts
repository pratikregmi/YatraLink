import {
  getCurrentUser,
  loginUser,
  signupUser,
  type UserResponse,
} from '../api'

export type AuthRole = 'TOURIST' | 'LOCAL_GUIDE'

export type SignupPayload = {
  full_name: string
  email: string
  password: string
  password_confirmation: string
  role?: AuthRole
}

export type LoginPayload = {
  email: string
  password: string
  role?: AuthRole
}

export function signup(payload: SignupPayload) {
  return signupUser(payload)
}

export function login(payload: LoginPayload) {
  return loginUser(payload)
}

export function getMe(token: string): Promise<UserResponse> {
  return getCurrentUser(token)
}