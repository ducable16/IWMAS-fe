import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

type DateInput = string | number | Date | null | undefined

export const formatDate = (d: DateInput, fmt = 'MMM D, YYYY'): string => dayjs(d).format(fmt)
export const formatRelative = (d: DateInput): string => dayjs(d).fromNow()
export const formatShort = (d: DateInput): string => dayjs(d).format('MMM D')
export const isOverdue = (d: DateInput): boolean => dayjs(d).isBefore(dayjs())
