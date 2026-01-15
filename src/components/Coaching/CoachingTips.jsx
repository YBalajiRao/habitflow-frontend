import React from 'react'
import { getTipPriority } from '../../services/coachingEngine'

function CoachingTips({ tips }) {
  if (!tips || tips.length === 0) {
    return (
      <div className="coaching-empty">
        <p>Keep tracking to receive personalized tips!</p>
      </div>
    )
  }

  const sortedTips = [...tips].sort((a, b) => 
    getTipPriority(a.type) - getTipPriority(b.type)
  )

  const getIcon = (type) => {
    const icons = {
      'grace_depleted': '⚠️',
      'reduce_target': '📉',
      'weak_day': '📅',
      'partial_pattern': '📊',
      'celebration': '🎉',
      'welcome': '👋'
    }
    return icons[type] || '💡'
  }

  return (
    <div className="coaching-tips">
      {sortedTips.map((tip, index) => (
        <div key={index} className={`tip-card tip-${tip.type}`}>
          <span className="tip-icon">{getIcon(tip.type)}</span>
          <p className="tip-message">{tip.message}</p>
        </div>
      ))}
    </div>
  )
}

export default CoachingTips
