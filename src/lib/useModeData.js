import { useQuery } from '@tanstack/react-query'
import { useAppMode } from '@/store/appModeStore'

/**
 * Branch a data source on the current app mode.
 *  - 'mock' → returns mockData immediately (no network), isLoading false
 *  - 'live' → calls queryFn via React Query, returns its result
 *
 * The shape mirrors React Query: { data, isLoading, isError, error, refetch }
 */
export function useModeData({ key, mockData, queryFn, enabled = true, select }) {
  const mode = useAppMode()
  const liveQuery = useQuery({
    queryKey: [...key, mode],
    queryFn,
    enabled: enabled && mode === 'live',
    select,
  })

  if (mode === 'mock') {
    const data = typeof select === 'function' ? select(mockData) : mockData
    return {
      data,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data }),
      mode,
    }
  }

  return { ...liveQuery, mode }
}
