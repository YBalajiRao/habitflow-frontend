import React, { useState } from 'react'
import { useHabitContext } from '../../context/HabitContext'
import HabitCard from '../Habits/HabitCard'
import DayView from './DayView'
import CoachingTips from '../Coaching/CoachingTips'
import { getWeekDays, formatDate, isScheduledForDay, getTodayString } from '../../utils/dateUtils'

function CalendarDashboard() {
  const { habits, loading } = useHabitContext()
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  
  const weekDays = getWeekDays(new Date())
  
  const scheduledHabits = habits.filter(habit => 
    isScheduledForDay(habit.schedule, selectedDate)
  )

  if (loading) {
    return <div className="loading-screen">Loading your habits...</div>
  }

  return (
    <div className="calendar-dashboard">
      <div className="week-nav">
        {weekDays.map(day => (
          <DayView
            key={formatDate(day)}
            date={day}
            isSelected={formatDate(day) === selectedDate}
            onSelect={() => setSelectedDate(formatDate(day))}
            habits={habits}
          />
        ))}
      </div>

      <div className="day-content">
        <h2 className="day-title">
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>

        {scheduledHabits.length === 0 ? (
          <div className="empty-state">
            <p>No habits scheduled for this day.</p>
            <a href="/add-habit" className="add-link">+ Add your first habit</a>
          </div>
        ) : (
          <div className="habits-grid">
            {scheduledHabits.map(habit => (
              <HabitCard 
                key={habit.habit_id} 
                habit={habit} 
                date={selectedDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarDashboard
