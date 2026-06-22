import type { Id } from './api'
import type { SearchSource } from '@/constants/enums'

export interface SearchResult {
  id: Id
  label?: string
  fullName?: string
  email?: string
  avatarUrl?: string | null
  source?: SearchSource | string
  [key: string]: unknown
}

export interface AutocompleteSuggestion {
  term: string
  entityId?: Id | undefined
}

export interface AutocompleteResponse {
  prefix?: string | undefined
  suggestions: AutocompleteSuggestion[]
  source?: SearchSource | string | undefined
  tookMs?: number | undefined
}

export type ProjectAutocompleteSource = Exclude<SearchSource, 'redis'>

export interface ProjectAutocompleteResponse extends Omit<AutocompleteResponse, 'source'> {
  source?: ProjectAutocompleteSource | undefined
}

export interface AutocompleteOption {
  value: Id
  label: string
  subtitle?: string | undefined
  avatarUrl?: string | null | undefined
  raw?: SearchResult | undefined
}

// ── §13.2 User search full results ────────────────────────────────────────────
export interface UserSearchResult {
  id: Id
  email: string
  fullName: string
  position: string | null
  avatarUrl: string | null
  role: string
}

export interface SearchUsersResponse {
  items: UserSearchResult[]
  total: number
  page: number
  size: number
  source?: string
  tookMs?: number
}

// ── §13.4 Project search full results ────────────────────────────────────────
export interface ProjectSearchResult {
  id: Id
  name: string
  code: string | null
  status: string
  managerId: Id
}

export interface SearchProjectsParams {
  q: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export interface SearchProjectsResponse {
  items: ProjectSearchResult[]
  total: number
  page: number
  size: number
  source?: string
  tookMs?: number
}
