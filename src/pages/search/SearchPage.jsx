import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { useUserSearch } from '@/features/search/hooks/useSearch'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import {
  USER_ROLE_LABEL,
  USER_ROLE_BADGE,
  SEARCH_SOURCE_LABEL,
} from '@/constants/enums'

const PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50 // §13.2 server-side cap

/**
 * §13.2 Search results page.
 * URL contract: /search?q=&page=&size=&sortBy=&sortDir=
 * Editing the input updates the URL (so the back button + sharing both work).
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const q       = searchParams.get('q')       ?? ''
  const page    = Number(searchParams.get('page') ?? 0)
  const size    = Math.min(Number(searchParams.get('size') ?? PAGE_SIZE), MAX_PAGE_SIZE)
  const sortBy  = searchParams.get('sortBy')  ?? ''        // '' = relevance ranking
  const sortDir = searchParams.get('sortDir') ?? 'desc'

  // Local input state so typing doesn't refetch on every keystroke
  const [input, setInput] = useState(q)
  useEffect(() => { setInput(q) }, [q])

  const { data, isLoading, isFetching, isError, error, refetch } = useUserSearch({
    q, page, size,
    sortBy:  sortBy  || undefined,
    sortDir: sortBy ? sortDir : undefined, // ignored by backend when sortBy missing
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / size))

  const updateParams = (patch, { resetPage = true } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) next.delete(k)
        else next.set(k, String(v))
      })
      if (resetPage && !('page' in patch)) next.delete('page')
      return next
    }, { replace: true })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    updateParams({ q: input.trim() })
  }

  const isStale = isFetching && !isLoading

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-subhead text-text-primary">Search</h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Find users by name, email, or position.
        </p>
      </div>

      {/* Search input */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-2 mb-4 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all"
      >
        <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Nguyen, sara@…, Senior Developer"
          className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
        />
        <button type="submit" className="btn-primary text-[12.5px] py-1 px-3">
          Search
        </button>
      </form>

      {/* Sort + size controls (only when we have a query) */}
      {q && (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            <span>Sort by</span>
            <select
              value={sortBy || 'relevance'}
              onChange={(e) => {
                const v = e.target.value
                updateParams({ sortBy: v === 'relevance' ? '' : v })
              }}
              className="bg-bg-surface border border-border rounded px-2 py-0.5 text-[12px]"
            >
              <option value="relevance">Relevance</option>
              <option value="fullName">Name</option>
              <option value="createdAt">Joined</option>
            </select>
            {sortBy && (
              <select
                value={sortDir}
                onChange={(e) => updateParams({ sortDir: e.target.value })}
                className="bg-bg-surface border border-border rounded px-2 py-0.5 text-[12px]"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            )}
          </div>
          {isStale && <span className="text-[11px] text-text-muted animate-pulse">Updating…</span>}
        </div>
      )}

      {/* States */}
      {!q && (
        <div className="card p-8 text-center">
          <p className="text-[13px] text-text-secondary">Type a query and press Enter to search.</p>
        </div>
      )}

      {q && isLoading && <LiveLoading label="Searching…" />}
      {q && isError && <LiveError error={error} onRetry={refetch} />}
      {q && !isLoading && !isError && total === 0 && (
        <LiveEmpty label={`No users match "${q}".`} />
      )}

      {/* Results */}
      {q && !isLoading && !isError && total > 0 && (
        <div className={clsx('card overflow-hidden transition-opacity', isStale && 'opacity-70')}>
          {/* Source banner — only highlight when degraded */}
          {data?.source === 'database' && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-warning-subtle text-warning text-[11.5px] border-b border-border-subtle">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
              {SEARCH_SOURCE_LABEL.database} — search index temporarily unavailable.
              Results may be incomplete.
            </div>
          )}

          <ul className="divide-y divide-border-subtle">
            {items.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-subtle/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/members?userId=${u.id}`)}
              >
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-border-subtle shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[12px] font-semibold text-accent shrink-0">
                    {u.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-text-primary truncate">{u.fullName}</p>
                  <p className="text-[12px] text-text-muted truncate">
                    {u.email}
                    {u.position && <> · <span className="text-text-secondary">{u.position}</span></>}
                  </p>
                </div>
                <span className={clsx('badge', USER_ROLE_BADGE[u.role] || 'badge-neutral')}>
                  {USER_ROLE_LABEL[u.role] || u.role}
                </span>
              </li>
            ))}
          </ul>

          {/* Pagination + diagnostics */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-bg-subtle/30 text-[12px] text-text-muted">
            <span>
              {total.toLocaleString()} result{total === 1 ? '' : 's'}
              {data?.source && (
                <> · via {data.source}{data.tookMs != null && <> · {data.tookMs}ms</>}</>
              )}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 0}
                  onClick={() => updateParams({ page: page - 1 }, { resetPage: false })}
                  className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 tabular-nums">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => updateParams({ page: page + 1 }, { resetPage: false })}
                  className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
