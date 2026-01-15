import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getHabitById, getProgressByHabit, deleteHabit } from '../../services/database'
import { useHabitContext } from '../../context/HabitContext'
import { generateCoachingTips } from '../../services/coachingEngine'
import { getStreakStatus, calculateStreakHealth } from '../../services/streakEngine'
import { formatDisplayDate } from '../../utils/dateUtils'
import { STREAK_STATUS_COLORS } from '../../utils/constants'
import CoachingTips from '../Coaching/CoachingTips'
import Button from '../common/Button'

function HabitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { streakStates, dispatch } = useHabitContext()
  
  const [habit, setHabit] = useState(null)
  const [progressHistory, setProgressHistory] = useState([])
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

  const streakState = streakStates[id]
  const streakStatus = getStreakStatus(streakState, habit?.grace_credits || 2)
  const streakHealth = calculateStreakHealth(streakState, habit?.grace_credits || 2)

  useEffect(() => {
    loadHabitData()
  }, [id])

  async function loadHabitData() {
    try {
      const habitData = await getHabitById(id)
      if (!habitData) {
        navigate('/')
        return
      }
      setHabit(habitData)
      
      const progress = await getProgressByHabit(id)
      setProgressHistory(progress.sort((a, b) => b.date.localeCompare(a.date)))
      
      const coachingTips = await generateCoachingTips(habitData, streakStates[id])
      setTips(coachingTips)
    } catch (error) {
      console.error('Error loading habit:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (window.confirm(`Are you sure you want to delete "${habit.name}"? This cannot be undone.`)) {
      await deleteHabit(id)
      dispatch({ type: 'DELETE_HABIT', payload: id })
      navigate('/')
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!habit) {
    return <div className="error-screen">Habit not found</div>
  }

  return (
    <div className="habit-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h2>{habit.name}</h2>
      </div>

      <div className="detail-grid">
        <div className="streak-card">
          <h3>Streak Status</h3>
          <div className="streak-display">
            <div 
              className="streak-number"
              style={{ color: STREAK_STATUS_COLORS[streakStatus] }}
            >
              🔥 {streakState?.current_streak || 0}
            </div>
            <div className="streak-label">day streak</div>
          </div>
          <div className="streak-meta">
            <div className="meta-item">
              <span className="label">Status:</span>
              <span className={`status-badge ${streakStatus}`}>{streakStatus}</span>
            </div>
            <div className="meta-item">
              <span className="label">Grace Credits:</span>
              <span>{streakState?.grace_remaining || 0}/{habit.grace_credits}</span>
            </div>
            <div className="meta-item">
              <span className="label">Health:</span>
              <div className="health-bar">
                <div 
                  className="health-fill" 
                  style={{ width: `${streakHealth}%` }}
                />
              </div>
              <span>{streakHealth}%</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Habit Info</h3>
          <div className="info-item">
            <span className="label">Target:</span>
            <span>{habit.target_value} {habit.unit}/day</span>
          </div>
          <div className="info-item">
            <span className="label">Schedule:</span>
            <span>{habit.schedule.join(', ')}</span>
          </div>
          <div className="info-item">
            <span className="label">Created:</span>
            <span>{formatDisplayDate(habit.created_at)}</span>
          </div>
        </div>

        <div className="tips-card">
          <h3>Coaching Tips</h3>
          <CoachingTips tips={tips} />
        </div>

        <div className="history-card">
          <h3>Recent Progress</h3>
          <div className="progress-list">
            {progressHistory.slice(0, 14).map(p => (
              <div key={p.date} className="progress-item">
                <span className="date">{formatDisplayDate(p.date)}</span>
                <span className="value">{p.progress}/{habit.target_value}</span>
                <span className={`status ${p.completed ? 'done' : 'pending'}`}>
                  {p.completed ? '✓' : '○'}
                </span>
              </div>
            ))}
            {progressHistory.length === 0 && (
              <p className="no-data">No progress recorded yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <Button variant="danger" onClick={handleDelete}>
          Delete Habit
        </Button>
      </div>
    </div>
  )
}

export default HabitDetail
