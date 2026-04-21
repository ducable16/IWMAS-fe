import { useModeData } from '@/lib/useModeData'
import { userService } from '../services/memberService'
import { MEMBERS } from '@/mocks/members'

export function useMembers() {
  return useModeData({
    key: ['members'],
    mockData: MEMBERS,
    queryFn: async () => {
      const res = await userService.getAll()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map((u) => ({
        id: u.id,
        name: u.fullName || u.name || u.email,
        email: u.email,
        role: u.role || u.title || 'Member',
        workloadScore: u.workloadScore ?? 0,
      }))
    },
  })
}
