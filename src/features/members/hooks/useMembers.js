import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/memberService'

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await userService.getAll()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map((u) => ({
        id: u.id,
        name: u.fullName || u.name || u.email,
        phone: u.phone || '',
        email: u.email,
        position: u.position || u.title || '',
        role: u.position || u.title || u.role || 'Member',
        systemRole: u.role || 'TEAM_MEMBER',
        workloadScore: u.workloadScore ?? 0,
      }))
    },
  })
}
