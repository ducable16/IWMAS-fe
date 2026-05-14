import api from '@/lib/axios'

/**
 * §13. Search & Autocomplete — base path: /api
 *
 * Backend: Redis cache → Elasticsearch → Postgres fallback.
 * Trả về `source` để FE phân biệt (xem SEARCH_SOURCES trong constants/enums.js).
 *
 * Cả hai endpoint đều require Bearer JWT (interceptor đã gắn).
 */
export const searchService = {
  /**
   * §13.1 GET /api/autocomplete?q={prefix}[&projectId=...][&excludeProjectId=...]
   *
   * Trả về { prefix, suggestions: [{ term, entityId }], source, tookMs }.
   * Server không debounce — FE phải debounce (~150–250ms) và cancel inflight
   * bằng AbortSignal khi user gõ tiếp.
   *
   * opts.projectId        — Restrict results to project participants (task assignee flow).
   * opts.excludeProjectId — Exclude project participants from results (add-member flow).
   * Hai param là mutually exclusive; nếu có cả hai, backend ưu tiên projectId.
   *
   * 400 SEARCH_QUERY_TOO_SHORT (9501) nếu `q.trim().length < 2` —
   * hook sẽ tự skip nên không thường gặp.
   *
   * @param {string} q
   * @param {AbortSignal} signal
   * @param {{ projectId?: number|string, excludeProjectId?: number|string }} [opts]
   */
  autocomplete: (q, signal, opts = {}) => {
    const params = { q }
    if (opts.projectId)        params.projectId        = opts.projectId
    if (opts.excludeProjectId) params.excludeProjectId = opts.excludeProjectId
    return api.get('/autocomplete', { params, signal })
  },

  /**
   * §13.3 GET /api/autocomplete/projects?q={prefix}
   * Project autocomplete.
   */
  autocompleteProjects: (q, signal) =>
    api.get('/autocomplete/projects', { params: { q }, signal }),

  /**
   * §13.2 GET /api/search?q&page&size&sortBy&sortDir
   *
   * Trả về { items: UserSearchResult[], total, page, size, source, tookMs }.
   * `items` là projection nhỏ hơn /api/users (chỉ id, email, fullName, position,
   * avatarUrl, role) — fetch /api/users/{id} nếu cần full profile.
   *
   * `size` bị cap 50 server-side. `sortBy` ∈ { fullName, createdAt },
   * khi bỏ trống sẽ sort theo relevance score.
   *
   * 503 SEARCH_BACKEND_UNAVAILABLE (9502) nếu cả ES lẫn DB fallback fail —
   * hiếm, treat như transient.
   */
  searchUsers: (params = {}, signal) => {
    const qs = new URLSearchParams()
    const append = (k, v) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v)
    }
    append('q',       params.q)
    append('page',    params.page ?? 0)
    append('size',    params.size ?? 20)
    append('sortBy',  params.sortBy)
    append('sortDir', params.sortDir)
    return api.get(`/search?${qs.toString()}`, { signal })
  },
}
