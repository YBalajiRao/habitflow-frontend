import { format, parseISO, isToday, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns'

export function formatDate(date) {
  if (typeof date === 'string') {
    return date
  }
  return format(date, 'yyyy-MM-dd')
}

export function formatDisplayDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDayName(date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE')
}

export function formatShortDay(date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEE')
}

export function getTodayString() {
  return formatDate(new Date())
}

export function isScheduledForDay(schedule, date) {
  const dayMap = {
    0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
  }
  const d = typeof date === 'string' ? parseISO(date) : date
  const dayName = dayMap[getDay(d)]
  return schedule.includes(dayName)
}

export function getWeekDays(date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  const start = startOfWeek(d, { weekStartsOn: 1 }) // Monday start
  const end = endOfWeek(d, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function getNextDays(count) {
  const days = []
  for (let i = 0; i < count; i++) {
    days.push(addDays(new Date(), i))
  }
  return days
}

export function getPastDays(count) {
  const days = []
  for (let i = count - 1; i >= 0; i--) {
    days.push(subDays(new Date(), i))
  }
  return days
}

export { isToday, parseISO, addDays, subDays }
