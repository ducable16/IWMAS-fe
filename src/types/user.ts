import type { UserRole } from '@/constants/enums'
import type { Id } from './api'

export interface UserPublicView {
  id: Id
  email: string
  fullName?: string | undefined
  /** Temporary presigned URL resolved by the API, or null when no avatar is set. */
  avatarUrl?: string | null | undefined
  position?: string | null | undefined
  role?: UserRole | string | null | undefined
}

export interface User extends UserPublicView {
  phone?: string | null | undefined
  active?: boolean | undefined
  verified?: boolean | null | undefined
  createdAt?: string | null | undefined
  lastLoginAt?: string | null | undefined
  workloadScore?: number | null | undefined
}

export interface MemberView {
  id: Id
  fullName: string
  email: string
  phone: string
  position: string
  role: UserRole | string
  status: 'ACTIVE' | 'DISABLED' | 'INVITED'
  lastActive: string | null
  createdAt: string | null
  verified: boolean | null
  /** Temporary presigned URL resolved by the API, or null when no avatar is set. */
  avatarUrl: string | null
  workloadScore: number
}

export interface AuthPayload {
  user: User
  accessToken: string
  expiresIn?: number | undefined
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface OtpRequest {
  email: string
  otp: string
}

/** §1.6 — send OTP to email for verification */
export interface SendOtpRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface UpdateOwnProfileRequest {
  name?: string | undefined
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/** §2.4 — Admin forcefully resets a user's password (no current password required) */
export interface AdminResetPasswordRequest {
  newPassword: string
}

export interface CreateUserRequest {
  email: string
  password: string
  fullName: string
  phone?: string | undefined
  position?: string | undefined
  role?: UserRole | string | undefined
}

export interface UpdateUserRequest {
  fullName?: string | undefined
  phone?: string | undefined
  position?: string | undefined
  role?: UserRole | string | undefined
}
