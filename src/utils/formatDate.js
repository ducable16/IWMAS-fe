import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export const formatDate = (d, fmt = 'MMM D, YYYY') => dayjs(d).format(fmt)
export const formatRelative = (d) => dayjs(d).fromNow()
export const formatShort = (d) => dayjs(d).format('MMM D')
export const isOverdue = (d) => dayjs(d).isBefore(dayjs())
