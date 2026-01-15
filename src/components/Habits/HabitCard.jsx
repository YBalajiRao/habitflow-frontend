import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { getProgress, updateProgress } from '../../services/database'
import { useHabitContext } from '../../context/HabitContext'
import { useAuth } from '../../context/AuthContext'
import { HABIT_COLORS, STREAK_STATUS_COLORS } from '../../utils/constants'
import { getStreakStatus } from '../../services/streakEngine'
import { triggerConfetti } from '../../utils/confetti'

function HabitCard({ habit, date }) {
  const navigate = useNavigate()
  const { streakStates } = useHabitContext()
  const { user } = useAuth()
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [justCompleted, setJustCompleted] = useState(false)
  const [xpGained, setXpGained] = useState(null)

  const streakState = streakStates[habit.habit_id]
  const streakStatus = getStreakStatus(streakState, habit.grace_credits)
  const colorIndex = habit.habit_id?.charCodeAt(0) % HABIT_COLORS.length || 0
  const habitColor = HABIT_COLORS[colorIndex]

  useEffect(() => {
    loadProgress()
  }, [habit.habit_id, date])

  async function loadProgress() {
    try {
      const data = await getProgress(habit.habit_id, date)
      setProgress(data?.progress || 0)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleIncrement() {
    const newProgress = Math.min(progress + 1, habit.target_value * 2)
    const wasIncomplete = progress < habit.target_value
    const isNowComplete = newProgress >= habit.target_value
    
    setProgress(newProgress)
    
    if (wasIncomplete && isNowComplete) {
      setJustCompleted(true)
      triggerConfetti()
      
      // Show XP notification
      const xpEarned = 10
      setXpGained(xpEarned)
      setTimeout(() => setXpGained(null), 2000)
      setTimeout(() => setJustCompleted(false), 600)
    }
    
    await updateProgress({
      habit_id: habit.habit_id,
      date: date,
      progress: newProgress,
      completed: newProgress >= habit.target_value
    })
  }

  async function handleDecrement() {
    const newProgress = Math.max(progress - 1, 0)
    setProgress(newProgress)
    await updateProgress({
      habit_id: habit.habit_id,
      date: date,
      progress: newProgress,
      completed: newProgress >= habit.target_value
    })
  }

  // Get streak badge
  function getStreakBadge() {
    const streak = streakState?.current_streak || 0
    if (streak >= 30) return { icon: '👑', label: 'Legend' }
    if (streak >= 14) return { icon: '💎', label: 'Master' }
    if (streak >= 7) return { icon: '⚔️', label: 'Warrior' }
    if (streak >= 3) return { icon: '🔥', label: 'Hot' }
    return { icon: '🔥', label: '' }
  }

  const badge = getStreakBadge()

  if (loading) {
    return <div className="habit-card loading">Loading...</div>
  }

  return (
    <div 
      className={`habit-card ${justCompleted ? 'celebrating' : ''}`}
      style={{ borderLeftColor: habitColor }}
    >
      {/* XP Popup */}
      {xpGained && (
        <div className="xp-popup">
          +{xpGained} XP ✨
        </div>
      )}

      <div className="habit-header" onClick={() => navigate(`/habit/${habit.habit_id}`)}>
        <h3>{habit.name}</h3>
        <div className="streak-container">
          {(streakState?.current_streak || 0) >= 3 && (
            <span className="streak-badge-label">{badge.label}</span>
          )}
          <div className="streak-badge" style={{ backgroundColor: STREAK_STATUS_COLORS[streakStatus] }}>
            {badge.icon} {streakState?.current_streak || 0}
          </div>
        </div>
      </div>
      
      <ProgressBar
        current={progress}
        target={habit.target_value}
        unit={habit.unit}
        color={habitColor}
      />

      <div className="habit-controls">
        <button className="control-btn decrement" onClick={handleDecrement}>−</button>
        <span className="current-value">{progress}</span>
        <button className="control-btn increment" onClick={handleIncrement}>+</button>
      </div>

      {streakState?.grace_remaining < habit.grace_credits && (
        <div className="grace-indicator">
          ⚡ Grace: {streakState.grace_remaining}/{habit.grace_credits}
        </div>
      )}

      {/* Completion reward hint */}
      {progress < habit.target_value && (
        <div className="reward-hint">
          Complete for +10 XP
        </div>
      )}
    </div>
  )
}

export default HabitCard