import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  setAuth: (user: User, token: string) => void
  updateUser: (user: User) => void
  setInitialized: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false, // true after first refresh attempt on startup

  setAuth: (user, token) =>
    set({ user, token, isAuthenticated: true }),
  updateUser: (user) => set({ user }),
  setInitialized: () => set({ isInitialized: true }),
  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),
}))
