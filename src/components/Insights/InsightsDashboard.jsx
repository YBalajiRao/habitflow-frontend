import React, { useState, useEffect } from 'react'
import { useHabitContext } from '../../context/HabitContext'
import { getProgressByHabit, getAllHabits } from '../../services/database'
import { getPastDays, formatDate, isScheduledForDay, subDays } from '../../utils/dateUtils'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function InsightsDashboard() {
  const { habits, streakStates } = useHabitContext()
  const [insights, setInsights] = useState({
    totalHabits: 0,
    completionRate: 0,
    bestStreak: 0,
    totalCompleted: 0,
    weeklyData: [],
    trendData: [],
    categoryData: [],
    heatmapData: [],
    topHabits: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7) // 7, 14, 30 days

  useEffect(() => {
    calculateInsights()
  }, [habits, streakStates, timeRange])

  async function calculateInsights() {
    if (habits.length === 0) {
      setLoading(false)
      return
    }

    try {
      const pastDays = getPastDays(timeRange)
      let totalScheduled = 0
      let totalCompleted = 0
      const dailyStats = []
      const trendStats = []
      const habitPerformance = []

      // Calculate daily and trend data
      for (const day of pastDays) {
        const dateStr = formatDate(day)
        let dayScheduled = 0
        let dayCompleted = 0

        for (const habit of habits) {
          if (isScheduledForDay(habit.schedule, day)) {
            dayScheduled++
            const progress = await getProgressByHabit(habit.habit_id)
            const dayProgress = progress.find(p => p.date === dateStr)
            if (dayProgress && dayProgress.progress >= habit.target_value) {
              dayCompleted++
            }
          }
        }

        totalScheduled += dayScheduled
        totalCompleted += dayCompleted

        dailyStats.push({
          date: dateStr,
          scheduled: dayScheduled,
          completed: dayCompleted
        })

        trendStats.push({
          date: dateStr,
          rate: dayScheduled > 0 ? Math.round((dayCompleted / dayScheduled) * 100) : 0
        })
      }

      // Calculate habit performance
      for (const habit of habits) {
        const progress = await getProgressByHabit(habit.habit_id)
        const recentProgress = progress.filter(p => {
          const progressDate = new Date(p.date)
          const cutoff = subDays(new Date(), timeRange)
          return progressDate >= cutoff
        })

        const scheduledCount = pastDays.filter(day => 
          isScheduledForDay(habit.schedule, day)
        ).length

        const completedCount = recentProgress.filter(p => 
          p.progress >= habit.target_value
        ).length

        habitPerformance.push({
          name: habit.name,
          rate: scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0,
          completed: completedCount,
          scheduled: scheduledCount
        })
      }

      // Sort and get top 5
      const topHabits = habitPerformance
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5)

      // Generate heatmap data (last 28 days)
      const heatmapDays = getPastDays(28)
      const heatmapData = []
      
      for (const day of heatmapDays) {
        const dateStr = formatDate(day)
        let dayScheduled = 0
        let dayCompleted = 0

        for (const habit of habits) {
          if (isScheduledForDay(habit.schedule, day)) {
            dayScheduled++
            const progress = await getProgressByHabit(habit.habit_id)
            const dayProgress = progress.find(p => p.date === dateStr)
            if (dayProgress && dayProgress.progress >= habit.target_value) {
              dayCompleted++
            }
          }
        }

        heatmapData.push({
          date: dateStr,
          level: dayScheduled === 0 ? 0 : Math.ceil((dayCompleted / dayScheduled) * 4)
        })
      }

      const bestStreak = Math.max(
        ...Object.values(streakStates).map(s => s?.current_streak || 0),
        0
      )

      setInsights({
        totalHabits: habits.length,
        completionRate: totalScheduled > 0 
          ? Math.round((totalCompleted / totalScheduled) * 100) 
          : 0,
        bestStreak,
        totalCompleted,
        weeklyData: dailyStats,
        trendData: trendStats,
        heatmapData,
        topHabits
      })
    } catch (error) {
      console.error('Error calculating insights:', error)
    } finally {
      setLoading(false)
    }
  }

  // Chart configurations
  const barChartData = {
    labels: insights.weeklyData.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Completed',
        data: insights.weeklyData.map(d => d.completed),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Scheduled',
        data: insights.weeklyData.map(d => d.scheduled),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderRadius: 6,
      }
    ]
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        labels: { color: '#d1d5db', font: { size: 12 } }
      },
      title: { 
        display: false
      }
    },
    scales: {
      x: {
        grid: { display: false, color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', font: { size: 11 } }
      },
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          stepSize: 1,
          color: '#9ca3af',
          font: { size: 11 }
        }
      }
    }
  }

  const lineChartData = {
    labels: insights.trendData.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Completion Rate %',
        data: insights.trendData.map(d => d.rate),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          callback: (value) => value + '%',
          color: '#9ca3af',
          font: { size: 11 }
        }
      }
    }
  }

  if (loading) {
    return <div className="loading-screen">Calculating insights...</div>
  }

  return (
    <div className="insights-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h2>Insights & Analytics</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${timeRange === 7 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeRange(7)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            7 Days
          </button>
          <button 
            className={`btn ${timeRange === 14 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeRange(14)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            14 Days
          </button>
          <button 
            className={`btn ${timeRange === 30 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeRange(30)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{insights.totalHabits}</div>
          <div className="stat-label">Active Habits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{insights.completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🔥 {insights.bestStreak}</div>
          <div className="stat-label">Best Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{insights.totalCompleted}</div>
          <div className="stat-label">Total Completed</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="chart-container" style={{ height: '300px' }}>
          <h3>Daily Progress</h3>
          {insights.weeklyData.length > 0 ? (
            <Bar data={barChartData} options={barChartOptions} />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        <div className="chart-container" style={{ height: '300px' }}>
          <h3>Completion Trend</h3>
          {insights.trendData.length > 0 ? (
            <Line data={lineChartData} options={lineChartOptions} />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="heatmap-container">
        <h3 style={{ marginBottom: '8px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Last 28 Days Activity
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          Darker colors indicate higher completion rates
        </p>
        <div className="heatmap-grid">
          {insights.heatmapData.map((day, index) => (
            <div 
              key={index}
              className={`heatmap-cell level-${day.level}`}
              title={`${day.date}: ${day.level}/4`}
            />
          ))}
        </div>
      </div>

      {/* Top Habits */}
      <div className="top-habits">
        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Top Performing Habits
        </h3>
        {insights.topHabits.length > 0 ? (
          insights.topHabits.map((habit, index) => (
            <div key={index} className="habit-rank-item">
              <div className="rank-number">{index + 1}</div>
              <div className="habit-rank-info">
                <div className="habit-rank-name">{habit.name}</div>
                <div className="habit-rank-rate">
                  {habit.completed}/{habit.scheduled} completed
                </div>
              </div>
              <div className="habit-rank-score">{habit.rate}%</div>
            </div>
          ))
        ) : (
          <p className="no-data">Start tracking to see your top habits!</p>
        )}
      </div>
    </div>
  )
}

export default InsightsDashboard