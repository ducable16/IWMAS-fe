import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TenantState {
  tenantId: string | null
  workspace: string | null
  setTenant: (tenantId: string | null, workspace: string | null) => void
  clearTenant: () => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: import.meta.env.VITE_TENANT_ID || null,
      workspace: null as string | null,
      setTenant: (tenantId, workspace) => set({ tenantId, workspace }),
      clearTenant: () => set({ tenantId: null, workspace: null }),
    }),
    { name: 'iwas-tenant' },
  ),
)
