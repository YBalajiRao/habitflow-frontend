import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getAllHabits, getAllStreakStates } from '../services/database'

const HabitContext = createContext()

const initialState = {
  habits: [],
  streakStates: {},
  selectedDate: new Date().toISOString().split('T')[0],
  loading: true,
  error: null
}

function habitReducer(state, action) {
  switch (action.type) {
    case 'SET_HABITS':
      return { ...state, habits: action.payload, loading: false }
    
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] }
    
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => 
          h.habit_id === action.payload.habit_id ? action.payload : h
        )
      }
    
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.habit_id !== action.payload)
      }
    
    case 'SET_STREAK_STATES':
      const streakMap = {}
      action.payload.forEach(s => { streakMap[s.habit_id] = s })
      return { ...state, streakStates: streakMap }
    
    case 'UPDATE_STREAK_STATE':
      return {
        ...state,
        streakStates: {
          ...state.streakStates,
          [action.payload.habit_id]: action.payload
        }
      }
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    default:
      return state
  }
}

export function HabitProvider({ children }) {
  const [state, dispatch] = useReducer(habitReducer, initialState)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const habits = await getAllHabits()
      const streakStates = await getAllStreakStates()
      dispatch({ type: 'SET_HABITS', payload: habits })
      dispatch({ type: 'SET_STREAK_STATES', payload: streakStates })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const value = {
    ...state,
    dispatch,
    refreshData: loadData
  }

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  )
}

export function useHabitContext() {
  const context = useContext(HabitContext)
  if (!context) {
    throw new Error('useHabitContext must be used within HabitProvider')
  }
  return context
}
