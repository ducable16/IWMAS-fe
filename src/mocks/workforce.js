export const WORKLOAD_MEMBERS = [
  { id: 1, name: 'Marcus Rivera', role: 'Senior Engineer', score: 89, tasksActive: 14, hoursThisWeek: 52, skills: ['React', 'Node.js', 'AWS'] },
  { id: 2, name: 'Tran Minh Duc', role: 'Backend Engineer', score: 81, tasksActive: 11, hoursThisWeek: 48, skills: ['Java', 'PostgreSQL', 'Docker'] },
  { id: 3, name: 'Chris Morgan', role: 'Full Stack Dev', score: 68, tasksActive: 9, hoursThisWeek: 44, skills: ['Vue', 'Python', 'Redis'] },
  { id: 4, name: 'Linh Nguyen', role: 'Frontend Dev', score: 61, tasksActive: 8, hoursThisWeek: 42, skills: ['React', 'TypeScript', 'Tailwind'] },
  { id: 5, name: 'David Torres', role: 'DevOps Engineer', score: 53, tasksActive: 7, hoursThisWeek: 40, skills: ['K8s', 'Terraform', 'CI/CD'] },
  { id: 6, name: 'Hana Lee', role: 'QA Engineer', score: 47, tasksActive: 6, hoursThisWeek: 38, skills: ['Cypress', 'Jest', 'Selenium'] },
  { id: 7, name: 'Jamie Park', role: 'Backend Engineer', score: 41, tasksActive: 6, hoursThisWeek: 37, skills: ['Go', 'gRPC', 'MongoDB'] },
  { id: 8, name: 'Priya Nair', role: 'Senior Engineer', score: 38, tasksActive: 5, hoursThisWeek: 35, skills: ['React', 'GraphQL', 'AWS'] },
  { id: 9, name: 'Sarah Chen', role: 'Frontend Dev', score: 34, tasksActive: 4, hoursThisWeek: 33, skills: ['React', 'CSS', 'Figma'] },
  { id: 10, name: 'Alex Kim', role: 'Infrastructure', score: 29, tasksActive: 3, hoursThisWeek: 30, skills: ['AWS', 'Linux', 'Python'] },
]

export const WORKLOAD_AT_RISK = [
  { name: 'Marcus Rivera', score: 89 },
  { name: 'Tran Minh Duc', score: 81 },
]

export const WORKLOAD_KPIS = {
  giniCoefficient: 0.38,
  capacityUsedPct: 78,
}

export const VELOCITY_DATA = [
  { sprint: 'S11', planned: 32, actual: 31 },
  { sprint: 'S12', planned: 35, actual: 29 },
  { sprint: 'S13', planned: 32, actual: 32 },
  { sprint: 'S14', planned: 28, actual: 26 },
  { sprint: 'S15', planned: 34, actual: null, forecast: 24 },
]

export const SPRINT_RISKS = [
  { level: 'critical', title: 'External dependency block', desc: 'Auth service API delayed by 3rd party team — affects TASK-189, TASK-201, TASK-202', impact: 'High', effort: 'Low to resolve' },
  { level: 'high', title: 'Developer overload', desc: 'Marcus Rivera at 89/100 workload. Velocity will degrade if not redistributed', impact: 'High', effort: 'Medium to resolve' },
  { level: 'medium', title: 'Scope creep detected', desc: '4 tasks added mid-sprint without removing existing ones (+14% scope increase)', impact: 'Medium', effort: 'Low to resolve' },
  { level: 'low', title: 'QA coverage gap', desc: 'Only 2 tasks have automated test coverage — manual testing bottleneck likely', impact: 'Low', effort: 'High to resolve' },
]
