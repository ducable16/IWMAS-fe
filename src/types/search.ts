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

export interface AutocompleteOption {
  value: Id
  label: string
  subtitle?: string | undefined
  avatarUrl?: string | null | undefined
  raw?: SearchResult | undefined
}
