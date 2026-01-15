import React from 'react'

function ProgressBar({ current, target, unit, color = '#4F46E5' }) {
  const percentage = Math.min((current / target) * 100, 100)
  const isComplete = current >= target

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: isComplete ? '#059669' : color
          }}
        />
      </div>
      <div className="progress-text">
        <span className={isComplete ? 'complete' : ''}>
          {current}/{target} {unit}
        </span>
        {isComplete && <span className="complete-badge">✓</span>}
      </div>
    </div>
  )
}

export default ProgressBar
