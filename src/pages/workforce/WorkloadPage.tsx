import { useState, useRef, useEffect, useDeferredValue } from 'react'
import { Navigate } from 'react-router-dom'
import { Search, X, BarChart3, FolderKanban } from 'lucide-react'
import clsx from 'clsx'
import ProjectWorkloadDashboard from '@/features/workforce/components/ProjectWorkloadDashboard'
import ProjectTaskList from '@/features/workforce/components/ProjectTaskList'
import { useProjects, useMyProjects } from '@/features/projects/hooks/useProjects'
import { useCan } from '@/utils/permissions'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { Project } from '@/types'

type ProjectAutocompleteProps = {
  onSelect: (project: Project | null) => void
}

type WorkloadView = 'workload' | 'tasks'

/* ── Project Autocomplete ───────────────────────────────────── */

function ProjectAutocomplete({ onSelect }: ProjectAutocompleteProps) {
  const can = useCan()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const deferredQuery = useDeferredValue(query)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Search projects via API — use appropriate hook by role
  const searchParams = { search: deferredQuery, size: 8, sortBy: 'name', sortDirection: 'ASC' }
  const adminQ  = useProjects(searchParams, can.isAdmin && open)
  const myQ     = useMyProjects(searchParams, !can.isAdmin && open)
  const { data, isFetching } = can.isAdmin ? adminQ : myQ
  const suggestions = data?.projects ?? []

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target instanceof Node && !containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (project: Project) => {
    onSelect(project)
    setQuery(project.name)
    setOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    onSelect(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px]">
      {/* Input */}
      <div className={clsx(
        'flex items-center gap-2 bg-bg-surface border rounded-lg px-3 py-2 transition-all',
        open
          ? 'border-accent ring-2 ring-accent/15'
          : 'border-border-subtle hover:border-border-strong',
      )}>
        <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search project by name or code…"
          className="flex-1 bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none min-w-0"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-30 bg-bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
          {isFetching && suggestions.length === 0 && (
            <div className="px-4 py-3 text-[12.5px] text-text-muted">Searching…</div>
          )}

          {!isFetching && suggestions.length === 0 && (
            <div className="px-4 py-3 text-[12.5px] text-text-muted">
              {query ? `No projects matching "${query}"` : 'Type to search projects…'}
            </div>
          )}

          {suggestions.map((p) => {
            return (
              <button
                key={p.id}
                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                onClick={() => handleSelect(p)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-subtle transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center text-[11px] font-bold text-accent shrink-0">
                  {p.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-text-primary truncate">{p.name}</p>
                  {p.code && (
                    <p className="text-[11px] text-text-muted">{p.code}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */

export default function WorkloadPage() {
  const can         = useCan()
  const currentUser = useAuthStore((s) => s.user)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [view, setView] = useState<WorkloadView>('workload')

  useEffect(() => {
    setView('workload')
  }, [selectedProject?.id])

  // TEAM_MEMBER cannot view team workload (§9.7 requires ADMIN/PM).
  // Redirect them directly to their own workload detail (§9.9).
  if (can.isHr) {
    return <Navigate to="/dashboard" replace />
  }

  if (can.isTm && currentUser?.id) {
    return <Navigate to={`/workforce/members/${currentUser.id}`} replace />
  }

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-subhead text-text-primary">Workload Analytics</h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Real-time team workload by project
        </p>
      </div>

      {/* Project search */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[12.5px] font-medium text-text-muted shrink-0">Project:</span>
        <ProjectAutocomplete onSelect={setSelectedProject} />

        {selectedProject && (
          <div className="flex items-center gap-2 text-[12.5px] text-text-muted">
            <FolderKanban className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="font-medium text-text-secondary">{selectedProject.name}</span>
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="flex items-center gap-2">
          {[
            { key: 'workload', label: 'Workload' },
            { key: 'tasks', label: 'Tasks' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as WorkloadView)}
              className={clsx(
                'px-3 py-1.5 text-[12.5px] font-medium rounded-lg border transition-colors',
                view === tab.key
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg-surface text-text-secondary border-border hover:border-border-strong',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Dashboard or empty state */}
      {selectedProject ? (
        <div className="card p-5">
          {view === 'workload' ? (
            <ProjectWorkloadDashboard projectId={selectedProject.id} />
          ) : (
            <ProjectTaskList projectId={selectedProject.id} />
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" strokeWidth={1.5} />
          <p className="text-[14px] text-text-muted">Select a project to view team workload</p>
          <p className="text-[12px] text-text-muted mt-1">
            Search for a project by name or code above
          </p>
        </div>
      )}
    </div>
  )
}
