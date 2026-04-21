export const SPRINT_BOARD = {
  todo: {
    id: 'todo',
    label: 'To do',
    dot: 'bg-text-muted',
    tasks: [
      { id: 't1', title: 'Design OAuth2 callback page', priority: 'high', assignee: 'SC', tags: ['frontend', 'auth'], comments: 2, estimate: '3h' },
      { id: 't2', title: 'Write migration scripts for v2 schema', priority: 'medium', assignee: 'JP', tags: ['backend', 'db'], comments: 0, estimate: '5h' },
      { id: 't3', title: 'Set up CI pipeline for staging', priority: 'low', assignee: 'AK', tags: ['devops'], comments: 1, estimate: '2h' },
    ],
  },
  inprogress: {
    id: 'inprogress',
    label: 'In progress',
    dot: 'bg-accent',
    tasks: [
      { id: 't4', title: 'Implement workload scoring algorithm', priority: 'high', assignee: 'MR', tags: ['backend', 'ai'], comments: 5, estimate: '8h' },
      { id: 't5', title: 'Sprint board drag-and-drop feature', priority: 'high', assignee: 'SC', tags: ['frontend'], comments: 3, estimate: '6h' },
      { id: 't6', title: 'API endpoint for smart assign', priority: 'medium', assignee: 'JP', tags: ['backend', 'api'], comments: 1, estimate: '4h' },
    ],
  },
  review: {
    id: 'review',
    label: 'In review',
    dot: 'bg-info',
    tasks: [
      { id: 't7', title: 'Notification bell component', priority: 'low', assignee: 'HL', tags: ['frontend'], comments: 2, estimate: '3h' },
      { id: 't8', title: 'User profile settings API', priority: 'medium', assignee: 'TD', tags: ['backend'], comments: 4, estimate: '5h' },
    ],
  },
  done: {
    id: 'done',
    label: 'Done',
    dot: 'bg-success',
    tasks: [
      { id: 't9', title: 'Login / Register pages', priority: 'high', assignee: 'PN', tags: ['frontend', 'auth'], comments: 6, estimate: '10h', done: true },
      { id: 't10', title: 'Database schema v1', priority: 'high', assignee: 'MR', tags: ['backend', 'db'], comments: 3, estimate: '8h', done: true },
      { id: 't11', title: 'Docker compose dev setup', priority: 'medium', assignee: 'AK', tags: ['devops'], comments: 1, estimate: '3h', done: true },
    ],
  },
}
