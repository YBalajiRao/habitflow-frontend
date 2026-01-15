import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { exportAllData } from '../../utils/exportData'

function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [notifications, setNotifications] = useState(true)

  async function handleExport() {
    setExporting(true)
    setMessage({ type: '', text: '' })
    
    try {
      const success = await exportAllData()
      if (success) {
        setMessage({ type: 'success', text: '✅ Data exported successfully!' })
      } else {
        setMessage({ type: 'error', text: '❌ Export failed. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Export failed: ' + error.message })
    }
    
    setExporting(false)
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  function handleThemeChange(newTheme) {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="settings-page">
      <h2>⚙️ Settings</h2>

      {/* Profile Section */}
      <div className="settings-section">
        <div className="section-header">
          <h3>👤 Profile</h3>
        </div>
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h4>{user?.username}</h4>
            <p>{user?.email}</p>
            <div className="profile-stats-row">
              <div className="profile-stat">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">Level {user?.level || 1}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-icon">✨</span>
                <span className="stat-value">{user?.total_xp || 0} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="settings-section">
        <div className="section-header">
          <h3>🎨 Appearance</h3>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Theme</span>
            <span className="setting-description">Choose your preferred color theme</span>
          </div>
          <div className="theme-options">
            <button 
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              🌙 Dark
            </button>
            <button 
              className={`theme-btn ${theme === 'midnight' ? 'active' : ''}`}
              onClick={() => handleThemeChange('midnight')}
            >
              🌌 Midnight
            </button>
            <button 
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              ☀️ Light
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="settings-section">
        <div className="section-header">
          <h3>🔔 Notifications</h3>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Daily Reminders</span>
            <span className="setting-description">Get reminded to complete your habits</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Achievement Alerts</span>
            <span className="setting-description">Get notified when you unlock achievements</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="settings-section">
        <div className="section-header">
          <h3>💾 Data Management</h3>
        </div>
        <p className="section-description">
          Your data is securely stored on our servers. Export a backup anytime.
        </p>

        <div className="settings-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? '⏳ Exporting...' : '📥 Export Data (JSON)'}
          </button>

          <label className="btn btn-secondary">
            📤 Import Data
            <input 
              type="file" 
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => setMessage({ type: 'info', text: '⚠️ Import feature coming soon!' })}
            />
          </label>
        </div>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Storage Info Section */}
      <div className="settings-section">
        <div className="section-header">
          <h3>📊 Storage Info</h3>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <span className="info-icon">🗄️</span>
            <div className="info-details">
              <span className="info-label">Storage Type</span>
              <span className="info-value">PostgreSQL Database</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">☁️</span>
            <div className="info-details">
              <span className="info-label">Sync Status</span>
              <span className="info-value success">Connected</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">🔒</span>
            <div className="info-details">
              <span className="info-label">Security</span>
              <span className="info-value">JWT Encrypted</span>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">📅</span>
            <div className="info-details">
              <span className="info-label">Member Since</span>
              <span className="info-value">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <div className="section-header">
          <h3>⚠️ Account</h3>
        </div>
        <div className="danger-actions">
          <button className="btn btn-danger-outline" onClick={handleLogout}>
            🚪 Log Out
          </button>
          <button className="btn btn-danger-outline">
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings