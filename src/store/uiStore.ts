import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ModalName = string | null

interface UIState {
  sidebarCollapsed: boolean
  sidebarWidth: number
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void
  setSidebarWidth: (value: number) => void
  activeModal: ModalName
  openModal: (modal: ModalName) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarWidth: 232,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setSidebarWidth: (v) => set({ sidebarWidth: v }),

      activeModal: null as ModalName,
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
    }),
    { name: 'iwas-ui' },
  ),
)
