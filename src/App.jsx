import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { HabitProvider } from './context/HabitContext'
import Navigation from './components/common/Navigation'
import CalendarDashboard from './components/Calendar/CalendarDashboard'
import HabitForm from './components/Habits/HabitForm'
import HabitDetail from './components/Habits/HabitDetail'
import InsightsDashboard from './components/Insights/InsightsDashboard'
import Achievements from './components/Achievements/Achievements'
import Settings from './components/Settings/Settings'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AuthenticatedApp() {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<CalendarDashboard />} />
          <Route path="/add-habit" element={<HabitForm />} />
          <Route path="/habit/:id" element={<HabitDetail />} />
          <Route path="/insights" element={<InsightsDashboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={
            <PrivateRoute>
              <AuthenticatedApp />
            </PrivateRoute>
          } />
        </Routes>
      </HabitProvider>
    </AuthProvider>
  )
}

export default App