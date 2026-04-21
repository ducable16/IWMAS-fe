import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppModeStore = create(
  persist(
    (set) => ({
      mode: 'mock',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'mock' ? 'live' : 'mock' })),
    }),
    { name: 'iwas-app-mode' },
  ),
)

export const useAppMode = () => useAppModeStore((s) => s.mode)
export const useIsMock = () => useAppModeStore((s) => s.mode === 'mock')
export const useIsLive = () => useAppModeStore((s) => s.mode === 'live')
