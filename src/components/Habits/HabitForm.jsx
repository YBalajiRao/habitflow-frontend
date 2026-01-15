import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { addHabit } from '../../services/database'
import { useHabitContext } from '../../context/HabitContext'
import Button from '../common/Button'
import { DAYS_OF_WEEK, DEFAULT_GRACE_CREDITS, SAMPLE_HABITS } from '../../utils/constants'

function HabitForm() {
  const navigate = useNavigate()
  const { dispatch } = useHabitContext()
  
  const [formData, setFormData] = useState({
    name: '',
    target_value: 1,
    unit: '',
    schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    time_window: 'any',
    grace_credits: DEFAULT_GRACE_CREDITS
  })

  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleNumberChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  function toggleDay(day) {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.includes(day)
        ? prev.schedule.filter(d => d !== day)
        : [...prev.schedule, day]
    }))
  }

  function loadTemplate(template) {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      target_value: template.target_value,
      unit: template.unit
    }))
  }

  function validate() {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (formData.target_value < 1) newErrors.target_value = 'Target must be at least 1'
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required'
    if (formData.schedule.length === 0) newErrors.schedule = 'Select at least one day'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const habit = {
      habit_id: uuidv4(),
      ...formData,
      created_at: new Date().toISOString()
    }

    try {
      await addHabit(habit)
      dispatch({ type: 'ADD_HABIT', payload: habit })
      dispatch({ 
        type: 'UPDATE_STREAK_STATE', 
        payload: {
          habit_id: habit.habit_id,
          current_streak: 0,
          grace_remaining: habit.grace_credits,
          last_completed: null
        }
      })
      navigate('/')
    } catch (error) {
      setErrors({ submit: 'Failed to create habit. Please try again.' })
    }
  }

  return (
    <div className="habit-form-container">
      <h2>Create New Habit</h2>
      
      <div className="templates">
        <p>Quick start:</p>
        <div className="template-buttons">
          {SAMPLE_HABITS.map(t => (
            <button 
              key={t.name} 
              type="button" 
              className="template-btn"
              onClick={() => loadTemplate(t)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Habit Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Drink Water"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="target_value">Daily Target</label>
            <input
              type="number"
              id="target_value"
              name="target_value"
              min="1"
              value={formData.target_value}
              onChange={handleNumberChange}
            />
            {errors.target_value && <span className="error">{errors.target_value}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g., glasses, pages, minutes"
            />
            {errors.unit && <span className="error">{errors.unit}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Schedule</label>
          <div className="day-selector">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.short}
                type="button"
                className={`day-btn ${formData.schedule.includes(day.short) ? 'active' : ''}`}
                onClick={() => toggleDay(day.short)}
              >
                {day.short}
              </button>
            ))}
          </div>
          {errors.schedule && <span className="error">{errors.schedule}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="grace_credits">Grace Credits (per month)</label>
          <input
            type="number"
            id="grace_credits"
            name="grace_credits"
            min="0"
            max="10"
            value={formData.grace_credits}
            onChange={handleNumberChange}
          />
          <small>Days you can miss without breaking your streak</small>
        </div>

        {errors.submit && <div className="error submit-error">{errors.submit}</div>}

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Habit
          </Button>
        </div>
      </form>
    </div>
  )
}

export default HabitForm
