import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'

/** Normalise a raw TaskResponse from the API into the shape used by the UI */
function normaliseTask(t) {
  // §4.6: assignee and reporter are full objects { id, fullName, email, role, ... }
  const assigneeName = t.assignee?.fullName || t.assignee?.email || '?'
  const reporterName = t.reporter?.fullName || t.reporter?.email || '?'
  return {
    id: t.id,
    title: t.title || 'Untitled',
    status: t.status ? t.status.toUpperCase() : 'TODO',
    priority: t.priority ? t.priority.toUpperCase() : 'MEDIUM',
    type: t.type || 'TASK',
    // Display initials for the avatar cell
    assignee: assigneeName.substring(0, 2).toUpperCase(),
    assigneeFull: assigneeName,
    assigneeId: t.assignee?.id ?? null,   // for filter matching
    reporterFull: reporterName,
    reporterId: t.reporter?.id ?? null,   // for filter matching
    sprint: t.sprint || '—',
    due: t.dueDate || null,
    estimate: t.estimatedHours ? `${t.estimatedHours}h` : '—',
    labels: t.labels || [],
    projectId: t.projectId,
    customFields: t.customFields || {},
    startDate: t.startDate || null,
    createdAt: t.createdAt || null,
  }
}

/**
 * Server-side search & filter — calls GET /api/tasks
 * @param {object} params – same shape as taskService.search
 */
export function useSearchTasks(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['tasks', 'search', params],
    queryFn: async () => {
      const res = await taskService.search(params)
      // axios interceptor unwraps ApiResponse.data → res.data IS TaskPageResponse
      const raw = res.data ?? {}
      // Support both paginated { content, totalElements, … } and plain array
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.content)
        ? raw.content
        : []
      return {
        tasks: items.map(normaliseTask),
        page: raw.page ?? params.page ?? 0,
        size: raw.size ?? params.size ?? 20,
        totalElements: raw.totalElements ?? items.length,
        totalPages: raw.totalPages ?? 1,
      }
    },
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: async () => {
      const res = await taskService.getMine()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map((t) => {
        const assigneeName = t.assignee?.fullName || '?'
        return {
          id: t.id,
          title: t.title || 'Untitled',
          status: t.status ? t.status.toLowerCase() : 'todo',
          priority: t.priority ? t.priority.toLowerCase() : 'medium',
          assignee: assigneeName.substring(0, 2).toUpperCase(),
          sprint: '—',
          due: t.dueDate || '—',
          estimate: t.estimatedHours ? `${t.estimatedHours}h` : '—',
        }
      })
    },
  })
}

export function useSprintBoard() {
  return useQuery({
    queryKey: ['sprint-board'],
    queryFn: async () => {
      const res = await taskService.getMine()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      const cols = {
        todo: { id: 'todo', label: 'To do', dot: 'bg-text-muted', tasks: [] },
        inprogress: { id: 'inprogress', label: 'In progress', dot: 'bg-accent', tasks: [] },
        review: { id: 'review', label: 'In review', dot: 'bg-info', tasks: [] },
        done: { id: 'done', label: 'Done', dot: 'bg-success', tasks: [] },
      }
      for (const t of items) {
        const statusLower = t.status ? t.status.toLowerCase() : 'todo'
        const key =
          statusLower === 'in_progress' ? 'inprogress' :
          statusLower === 'in_review' ? 'review' :
          statusLower === 'done' ? 'done' : 'todo'
        
        const assigneeName = t.assignee?.fullName || '?'
        
        cols[key].tasks.push({
          id: String(t.id),
          title: t.title || 'Untitled',
          priority: t.priority ? t.priority.toLowerCase() : 'medium',
          assignee: assigneeName.substring(0, 2).toUpperCase(),
          tags: [],
          comments: 0,
          estimate: t.estimatedHours ? `${t.estimatedHours}h` : '',
          done: key === 'done',
        })
      }
      return cols
    },
  })
}
