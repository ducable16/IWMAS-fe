import api from '@/lib/axios'

export const taskService = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getMine: () => api.get('/tasks/my'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.post(`/tasks/${id}/update`, data),
  updateStatus: (id, data) => api.post(`/tasks/${id}/status`, data),
  remove: (id) => api.post(`/tasks/${id}/delete`),
  getHistory: (id) => api.get(`/tasks/${id}/history`),
  
  // Comments
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  updateComment: (taskId, commentId, data) => api.post(`/tasks/${taskId}/comments/${commentId}/update`, data),
  deleteComment: (taskId, commentId) => api.post(`/tasks/${taskId}/comments/${commentId}/delete`),
}
