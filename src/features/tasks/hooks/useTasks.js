import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: async () => {
      const res = await taskService.getMine()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map((t) => {
        const assigneeName = t.assignee?.fullName || t.assignee?.username || '?'
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
        
        const assigneeName = t.assignee?.fullName || t.assignee?.username || '?'
        
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
