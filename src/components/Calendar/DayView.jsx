import React, { useState, useEffect } from 'react'
import { formatDate, formatShortDay, isToday, isScheduledForDay } from '../../utils/dateUtils'
import { getProgressByDate } from '../../services/database'

function DayView({ date, isSelected, onSelect, habits }) {
  const [dayProgress, setDayProgress] = useState({ completed: 0, total: 0 })
  const dateString = formatDate(date)
  const isCurrentDay = isToday(date)

  useEffect(() => {
    calculateDayProgress()
  }, [dateString, habits])

  async function calculateDayProgress() {
    const scheduledHabits = habits.filter(h => isScheduledForDay(h.schedule, date))
    if (scheduledHabits.length === 0) {
      setDayProgress({ completed: 0, total: 0 })
      return
    }

    const progress = await getProgressByDate(dateString)
    let completed = 0

    scheduledHabits.forEach(habit => {
      const habitProgress = progress.find(p => p.habit_id === habit.habit_id)
      if (habitProgress && habitProgress.progress >= habit.target_value) {
        completed++
      }
    })

    setDayProgress({ completed, total: scheduledHabits.length })
  }

  const progressPercentage = dayProgress.total > 0 
    ? (dayProgress.completed / dayProgress.total) * 100 
    : 0

  return (
    <div 
      className={`day-view ${isSelected ? 'selected' : ''} ${isCurrentDay ? 'today' : ''}`}
      onClick={onSelect}
    >
      <div className="day-name">{formatShortDay(date)}</div>
      <div className="day-number">{date.getDate()}</div>
      {dayProgress.total > 0 && (
        <div className="day-progress">
          <div 
            className="day-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
      <div className="day-stats">
        {dayProgress.total > 0 ? `${dayProgress.completed}/${dayProgress.total}` : '—'}
      </div>
    </div>
  )
}

export default DayView
