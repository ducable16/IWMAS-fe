import api from '@/lib/axios'
import type { AutocompleteResponse, Id, SearchResult } from '@/types'
import type { SearchSource } from '@/constants/enums'

interface AutocompleteOptions {
  projectId?: Id | undefined
  excludeProjectId?: Id | undefined
}

interface SearchUsersParams {
  q?: string | undefined
  page?: number | undefined
  size?: number | undefined
  sortBy?: string | undefined
  sortDir?: string | undefined
}

interface SearchUsersResponse {
  items: SearchResult[]
  total: number
  page: number
  size: number
  source?: SearchSource | string
  tookMs?: number
}

export const searchService = {
  autocomplete: (q: string, signal?: AbortSignal, opts: AutocompleteOptions = {}) => {
    const params: Record<string, Id> = { q }
    if (opts.projectId) params.projectId = opts.projectId
    if (opts.excludeProjectId) params.excludeProjectId = opts.excludeProjectId
    return api.get<AutocompleteResponse>('/autocomplete', { params, ...(signal ? { signal } : {}) })
  },

  autocompleteProjects: (q: string, signal?: AbortSignal) =>
    api.get<AutocompleteResponse>('/autocomplete/projects', { params: { q }, ...(signal ? { signal } : {}) }),

  searchUsers: (params: SearchUsersParams = {}, signal?: AbortSignal) => {
    const qs = new URLSearchParams()
    const append = (k: string, v: string | number | null | undefined) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v))
    }
    append('q', params.q)
    append('page', params.page ?? 0)
    append('size', params.size ?? 20)
    append('sortBy', params.sortBy)
    append('sortDir', params.sortDir)
    return api.get<SearchUsersResponse>(`/search?${qs.toString()}`, signal ? { signal } : undefined)
  },
}
