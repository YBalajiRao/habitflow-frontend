import { getStreakState, updateStreakState, getProgress } from './database'
import { formatDate, isScheduledForDay } from '../utils/dateUtils'

const STREAK_DECAY_PERCENTAGE = 0.5 // 50% decay when no grace

export async function processStreakUpdate(habit, date) {
  const streakState = await getStreakState(habit.habit_id)
  const progress = await getProgress(habit.habit_id, date)
  
  if (!streakState) return null

  const isScheduled = isScheduledForDay(habit.schedule, date)
  if (!isScheduled) return streakState

  const isCompleted = progress && progress.progress >= habit.target_value

  let updatedStreak = { ...streakState }

  if (isCompleted) {
    // Habit completed - increment streak
    updatedStreak.current_streak += 1
    updatedStreak.last_completed = date
  } else {
    // Habit missed
    if (updatedStreak.grace_remaining > 0) {
      // Use grace credit - streak continues
      updatedStreak.grace_remaining -= 1
    } else {
      // No grace - decay streak (not reset!)
      updatedStreak.current_streak = Math.floor(
        updatedStreak.current_streak * STREAK_DECAY_PERCENTAGE
      )
    }
  }

  await updateStreakState(updatedStreak)
  return updatedStreak
}

export async function checkAndUpdateStreaks(habits, date) {
  const results = []
  for (const habit of habits) {
    const result = await processStreakUpdate(habit, date)
    results.push({ habit_id: habit.habit_id, streak: result })
  }
  return results
}

export function calculateStreakHealth(streakState, graceCreditMax) {
  if (!streakState) return 0
  
  const graceRatio = streakState.grace_remaining / graceCreditMax
  const streakBonus = Math.min(streakState.current_streak / 30, 1) // Max at 30 days
  
  return Math.round((graceRatio * 50) + (streakBonus * 50))
}

export function getStreakStatus(streakState, graceCreditMax) {
  if (!streakState) return 'new'
  
  if (streakState.grace_remaining === 0) return 'fragile'
  if (streakState.current_streak >= 30) return 'strong'
  if (streakState.current_streak >= 7) return 'building'
  return 'starting'
}
