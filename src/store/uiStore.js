import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      activeModal: null,
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
    }),
    { name: 'iwas-ui' },
  ),
)
