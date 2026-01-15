import { getProgressByHabit } from './database'
import { subDays, parseISO, getDay } from 'date-fns'

const ANALYSIS_WINDOW_DAYS = 14

export async function generateCoachingTips(habit, streakState) {
  const tips = []
  const progressHistory = await getProgressByHabit(habit.habit_id)
  
  if (progressHistory.length < 3) {
    tips.push({
      type: 'welcome',
      message: `Great start with "${habit.name}"! Keep logging for personalized tips.`
    })
    return tips
  }

  // Analyze last 14 days
  const recentProgress = getRecentProgress(progressHistory, ANALYSIS_WINDOW_DAYS)
  
  // Rule 1: Check for frequent misses
  const missedDays = countMissedDays(recentProgress, habit)
  if (missedDays >= 3) {
    tips.push({
      type: 'reduce_target',
      message: `You've missed "${habit.name}" ${missedDays} times recently. Consider reducing your target from ${habit.target_value} to ${Math.ceil(habit.target_value * 0.75)}.`
    })
  }

  // Rule 2: Check for day-of-week patterns
  const weakDay = findWeakDay(progressHistory, habit)
  if (weakDay) {
    tips.push({
      type: 'weak_day',
      message: `You often miss "${habit.name}" on ${weakDay}s. Consider adjusting your schedule.`
    })
  }

  // Rule 3: Check grace status
  if (streakState && streakState.grace_remaining === 0) {
    tips.push({
      type: 'grace_depleted',
      message: `Your streak for "${habit.name}" is fragile! Complete it today to start recovering grace credits.`
    })
  }

  // Rule 4: Celebrate consistency
  if (streakState && streakState.current_streak >= 7) {
    tips.push({
      type: 'celebration',
      message: `Amazing! ${streakState.current_streak} day streak on "${habit.name}"! You're building a solid habit.`
    })
  }

  // Rule 5: Partial completion pattern
  const partialCompletions = countPartialCompletions(recentProgress, habit)
  if (partialCompletions >= 5) {
    tips.push({
      type: 'partial_pattern',
      message: `You often partially complete "${habit.name}". Your natural target might be around ${calculateAverageProgress(recentProgress)}.`
    })
  }

  return tips
}

function getRecentProgress(progressHistory, days) {
  const cutoffDate = subDays(new Date(), days)
  return progressHistory.filter(p => parseISO(p.date) >= cutoffDate)
}

function countMissedDays(recentProgress, habit) {
  return recentProgress.filter(p => p.progress < habit.target_value).length
}

function countPartialCompletions(recentProgress, habit) {
  return recentProgress.filter(p => 
    p.progress > 0 && p.progress < habit.target_value
  ).length
}

function calculateAverageProgress(recentProgress) {
  if (recentProgress.length === 0) return 0
  const sum = recentProgress.reduce((acc, p) => acc + p.progress, 0)
  return Math.round(sum / recentProgress.length)
}

function findWeakDay(progressHistory, habit) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayMisses = [0, 0, 0, 0, 0, 0, 0]
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]

  progressHistory.forEach(p => {
    const dayIndex = getDay(parseISO(p.date))
    dayCounts[dayIndex]++
    if (p.progress < habit.target_value) {
      dayMisses[dayIndex]++
    }
  })

  let weakestDay = null
  let highestMissRate = 0.5 // Only flag if miss rate > 50%

  for (let i = 0; i < 7; i++) {
    if (dayCounts[i] >= 2) { // Need at least 2 occurrences
      const missRate = dayMisses[i] / dayCounts[i]
      if (missRate > highestMissRate) {
        highestMissRate = missRate
        weakestDay = dayNames[i]
      }
    }
  }

  return weakestDay
}

export function getTipPriority(tipType) {
  const priorities = {
    'grace_depleted': 1,
    'reduce_target': 2,
    'weak_day': 3,
    'partial_pattern': 4,
    'celebration': 5,
    'welcome': 6
  }
  return priorities[tipType] || 99
}
