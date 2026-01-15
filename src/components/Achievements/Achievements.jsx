import React from 'react'
import { useAuth } from '../../context/AuthContext'

const ACHIEVEMENT_LIST = [
  {
    id: 1,
    title: "First Step",
    description: "Complete your first habit",
    icon: "🌱",
    xp: 10,
    requirement: 1,
    type: "completions"
  },
  {
    id: 2,
    title: "3-Day Streak",
    description: "Maintain a 3-day streak on any habit",
    icon: "🔥",
    xp: 25,
    requirement: 3,
    type: "streak"
  },
  {
    id: 3,
    title: "7-Day Warrior",
    description: "Maintain a 7-day streak on any habit",
    icon: "⚔️",
    xp: 50,
    requirement: 7,
    type: "streak"
  },
  {
    id: 4,
    title: "Habit Master",
    description: "Complete 50 total habits",
    icon: "🎯",
    xp: 100,
    requirement: 50,
    type: "completions"
  },
  {
    id: 5,
    title: "30-Day Legend",
    description: "Maintain a 30-day streak on any habit",
    icon: "👑",
    xp: 200,
    requirement: 30,
    type: "streak"
  },
  {
    id: 6,
    title: "Century Club",
    description: "Earn 100 total XP",
    icon: "💯",
    xp: 50,
    requirement: 100,
    type: "xp"
  },
  {
    id: 7,
    title: "Habit Builder",
    description: "Create 5 different habits",
    icon: "🏗️",
    xp: 30,
    requirement: 5,
    type: "habits_created"
  },
  {
    id: 8,
    title: "Perfect Week",
    description: "Complete all habits for 7 days straight",
    icon: "🌟",
    xp: 100,
    requirement: 7,
    type: "perfect_days"
  }
]

function Achievements() {
  const { user } = useAuth()
  const totalXP = user?.total_xp || 0

  // Calculate unlocked achievements (simplified for demo)
  function isUnlocked(achievement) {
    if (achievement.type === 'xp') {
      return totalXP >= achievement.requirement
    }
    // For demo, unlock based on XP thresholds
    return totalXP >= achievement.xp * 2
  }

  const unlockedCount = ACHIEVEMENT_LIST.filter(a => isUnlocked(a)).length

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h2>🏆 Achievements</h2>
        <div className="achievements-progress">
          <span className="unlocked-count">{unlockedCount}</span>
          <span className="total-count">/ {ACHIEVEMENT_LIST.length} Unlocked</span>
        </div>
      </div>

      <div className="achievements-grid">
        {ACHIEVEMENT_LIST.map(achievement => {
          const unlocked = isUnlocked(achievement)
          return (
            <div 
              key={achievement.id} 
              className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {unlocked ? achievement.icon : '🔒'}
              </div>
              <div className="achievement-info">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <span className="achievement-xp">+{achievement.xp} XP</span>
              </div>
              {unlocked && <div className="achievement-check">✓</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Achievements