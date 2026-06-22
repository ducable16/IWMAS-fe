import api from '@/lib/axios'
import type {
  AutocompleteResponse,
  Id,
  ProjectAutocompleteResponse,
  SearchProjectsParams,
  SearchProjectsResponse,
} from '@/types'

interface AutocompleteOptions {
  projectId?: Id | undefined
  excludeProjectId?: Id | undefined
  role?: string | undefined
}

interface SearchUsersParams {
  q?: string | undefined
  role?: string | undefined
  page?: number | undefined
  size?: number | undefined
  sortBy?: string | undefined
  sortDir?: string | undefined
}

interface SearchUsersResponse {
  items: {
    id: Id
    email: string
    fullName: string
    position: string | null
    avatarUrl: string | null
    role: string
  }[]
  total: number
  page: number
  size: number
  source?: string
  tookMs?: number
}

export const searchService = {
  /**
   * §13.1 GET /api/autocomplete — user typeahead
   * Debounce 200ms on the caller side; min 2 chars.
   * opts.projectId      → restrict to project participants (Redis bypassed)
   * opts.excludeProjectId → exclude project participants (add-member typeahead)
   */
  autocomplete: (q: string, signal?: AbortSignal, opts: AutocompleteOptions = {}) => {
    const params: Record<string, Id> = { q }
    if (opts.projectId)        params.projectId        = opts.projectId
    if (opts.excludeProjectId) params.excludeProjectId = opts.excludeProjectId
    if (opts.role)             params.role             = opts.role
    return api.get<AutocompleteResponse>('/autocomplete', { params, ...(signal ? { signal } : {}) })
  },

  /**
   * §13.3 GET /api/autocomplete/projects — project typeahead
   */
  autocompleteProjects: (q: string, signal?: AbortSignal) =>
    api.get<ProjectAutocompleteResponse>('/autocomplete/projects', { params: { q }, ...(signal ? { signal } : {}) }),

  /**
   * §13.2 GET /api/search — full paginated user search (ES + Postgres fallback)
   */
  searchUsers: (params: SearchUsersParams = {}, signal?: AbortSignal) => {
    const qs = new URLSearchParams()
    const append = (k: string, v: string | number | null | undefined) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v))
    }
    append('q', params.q)
    append('role', params.role)
    append('page', params.page ?? 0)
    append('size', params.size ?? 20)
    append('sortBy', params.sortBy)
    append('sortDir', params.sortDir)
    return api.get<SearchUsersResponse>(`/search?${qs.toString()}`, signal ? { signal } : undefined)
  },

  /**
   * §13.4 GET /api/search/projects — full paginated project search (ES + Postgres fallback)
   * Not access-controlled by project membership — any authenticated user can search project names.
   */
  searchProjects: (params: SearchProjectsParams, signal?: AbortSignal) => {
    const qs = new URLSearchParams()
    const append = (k: string, v: string | number | null | undefined) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v))
    }
    append('q', params.q)
    append('page', params.page ?? 0)
    append('size', params.size ?? 20)
    append('sortBy', params.sortBy)
    append('sortDir', params.sortDir)
    return api.get<SearchProjectsResponse>(`/search/projects?${qs.toString()}`, signal ? { signal } : undefined)
  },
}
