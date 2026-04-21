import { useModeData } from '@/lib/useModeData'
import { projectService } from '../services/projectService'
import { PROJECTS } from '@/mocks/projects'

export function useProjects() {
  return useModeData({
    key: ['projects'],
    mockData: PROJECTS,
    queryFn: async () => {
      const res = await projectService.getAll()
      return Array.isArray(res.data) ? res.data : res.data?.items || []
    },
  })
}
