export const workloadColor = (score) =>
  score >= 80 ? '#F87171' :
  score >= 60 ? '#FB923C' :
  score >= 40 ? '#FBBF24' : '#34D399'

export const priorityColor = (p) =>
  ({ high: '#F87171', medium: '#FBBF24', low: '#526380' })[p] || '#526380'

export const statusColor = (s) =>
  ({ done: '#34D399', in_progress: '#22D3EE', review: '#818CF8', todo: '#526380' })[s] || '#526380'
