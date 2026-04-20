import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTenantStore = create(
  persist(
    (set) => ({
      tenantId: import.meta.env.VITE_TENANT_ID || null,
      workspace: null,
      setTenant: (tenantId, workspace) => set({ tenantId, workspace }),
      clearTenant: () => set({ tenantId: null, workspace: null }),
    }),
    { name: 'iwas-tenant' },
  ),
)
