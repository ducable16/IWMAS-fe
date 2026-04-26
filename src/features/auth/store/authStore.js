import { create } from 'zustand'

export const useAuthStore = create((set) => ({
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
