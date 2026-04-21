import { useModeData } from '@/lib/useModeData'
import { taskService } from '../services/taskService'
import { TASKS } from '@/mocks/tasks'
import { SPRINT_BOARD } from '@/mocks/sprints'

export function useTasks() {
  return useModeData({
    key: ['tasks', 'mine'],
    mockData: TASKS,
    queryFn: async () => {
      const res = await taskService.getMine()
      return Array.isArray(res.data) ? res.data : res.data?.items || []
    },
  })
}

export function useSprintBoard() {
  return useModeData({
    key: ['sprint-board'],
    mockData: SPRINT_BOARD,
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
        const key =
          t.status === 'IN_PROGRESS' || t.status === 'in_progress'
            ? 'inprogress'
            : t.status === 'REVIEW' || t.status === 'review'
              ? 'review'
              : t.status === 'DONE' || t.status === 'done'
                ? 'done'
                : 'todo'
        cols[key].tasks.push({
          id: String(t.id),
          title: t.title || t.name || 'Untitled',
          priority: (t.priority || 'medium').toLowerCase(),
          assignee: (t.assigneeName || t.assignee || '?').toString().slice(0, 2).toUpperCase(),
          tags: t.tags || [],
          comments: t.commentCount || 0,
          estimate: t.estimateHours ? `${t.estimateHours}h` : '',
          done: key === 'done',
        })
      }
      return cols
    },
  })
}
