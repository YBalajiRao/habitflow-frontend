import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navigation() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  const currentXP = user?.total_xp || 0
  const currentLevel = user?.level || 1
  const xpForNextLevel = currentLevel * 100
  const xpProgress = (currentXP % 100) / 100 * 100

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>🎯 HabitFlow</h1>
      </div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          📅 Dashboard
        </NavLink>
        <NavLink to="/add-habit" className={({ isActive }) => isActive ? 'active' : ''}>
          ➕ Add Habit
        </NavLink>
        <NavLink to="/insights" className={({ isActive }) => isActive ? 'active' : ''}>
          📊 Insights
        </NavLink>
      </div>

      <div className="nav-right">
        {/* XP Progress */}
        <div className="xp-container">
          <div className="level-badge">
            <span className="level-icon">⭐</span>
            <span className="level-number">{currentLevel}</span>
          </div>
          <div className="xp-bar-wrapper">
            <div className="xp-bar">
              <div 
                className="xp-fill" 
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="xp-text">{currentXP % 100}/{100} XP</span>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="profile-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="dropdown-info">
                  <span className="dropdown-name">{user?.username}</span>
                  <span className="dropdown-email">{user?.email}</span>
                </div>
              </div>

              <div className="dropdown-stats">
                <div className="stat">
                  <span className="stat-value">⭐ {currentLevel}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat">
                  <span className="stat-value">✨ {currentXP}</span>
                  <span className="stat-label">Total XP</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button className="dropdown-item" onClick={() => navigate('/achievements')}>
                🏆 Achievements
              </button>
              <button className="dropdown-item" onClick={() => navigate('/settings')}>
                ⚙️ Settings
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                🚪 Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation