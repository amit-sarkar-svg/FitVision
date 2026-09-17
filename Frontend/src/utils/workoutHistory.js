/**
 * Helper to get the start of the current week (Monday 00:00:00.000).
 */
function getStartOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday is 0 in JS. We treat Monday as day 1, Sunday as day 7.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Helper to get the end of the current week (Sunday 23:59:59.999).
 */
function getEndOfWeek(date = new Date()) {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Calculate summary metrics from workout history:
 * - totalWorkouts
 * - totalExercises
 * - workoutsThisWeek
 */
export function getWorkoutStatistics(history = []) {
  const totalWorkouts = history.length
  const totalExercises = history.reduce((sum, item) => sum + (Number(item.exercisesCompleted || item.completedExercises) || 0), 0)

  const now = new Date()
  const weekStart = getStartOfWeek(now)
  const weekEnd = getEndOfWeek(now)

  const workoutsThisWeek = history.filter((item) => {
    const completedDate = new Date(item.completedAt)
    return completedDate >= weekStart && completedDate <= weekEnd
  }).length

  return {
    totalWorkouts,
    totalExercises,
    workoutsThisWeek,
  }
}

/**
 * Returns an array of 7 day objects for the current week (Monday to Sunday)
 * indicating whether a workout was completed on that day and if it's today.
 */
export function getWeeklyActivity(history = []) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const now = new Date()
  const weekStart = getStartOfWeek(now)
  const todayDateStr = now.toDateString()

  return daysOfWeek.map((dayName, index) => {
    const dayDate = new Date(weekStart)
    dayDate.setDate(weekStart.getDate() + index)
    const dayDateStr = dayDate.toDateString()

    const workoutsOnDay = history.filter((item) => {
      const itemDate = new Date(item.completedAt)
      return itemDate.toDateString() === dayDateStr
    })

    return {
      dayName,
      date: dayDate,
      dateFormatted: dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      isToday: dayDateStr === todayDateStr,
      hasWorkout: workoutsOnDay.length > 0,
      workoutCount: workoutsOnDay.length,
      workouts: workoutsOnDay,
    }
  })
}

/**
 * Format an ISO date string into a user-friendly date format (e.g., "25 Aug 2026").
 */
export function formatWorkoutDate(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return isoString
  }
}

/**
 * Format an ISO date string into date + time (e.g., "25 Aug 2026, 8:30 PM").
 */
export function formatWorkoutDateTime(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}
