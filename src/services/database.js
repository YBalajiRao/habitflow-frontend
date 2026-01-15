import { openDB } from 'idb'

const DB_NAME = 'HabitTrackerDB'
const DB_VERSION = 1

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Habits store
      if (!db.objectStoreNames.contains('habits')) {
        const habitStore = db.createObjectStore('habits', { keyPath: 'habit_id' })
        habitStore.createIndex('name', 'name')
        habitStore.createIndex('created_at', 'created_at')
      }

      // Daily Progress store
      if (!db.objectStoreNames.contains('dailyProgress')) {
        const progressStore = db.createObjectStore('dailyProgress', { 
          keyPath: ['habit_id', 'date'] 
        })
        progressStore.createIndex('habit_id', 'habit_id')
        progressStore.createIndex('date', 'date')
      }

      // Streak State store
      if (!db.objectStoreNames.contains('streakState')) {
        db.createObjectStore('streakState', { keyPath: 'habit_id' })
      }
    }
  })
  return db
}

// HABIT OPERATIONS
export async function addHabit(habit) {
  const db = await initDB()
  await db.put('habits', habit)
  // Initialize streak state
  await db.put('streakState', {
    habit_id: habit.habit_id,
    current_streak: 0,
    grace_remaining: habit.grace_credits,
    last_completed: null
  })
  return habit
}

export async function getAllHabits() {
  const db = await initDB()
  return await db.getAll('habits')
}

export async function getHabitById(id) {
  const db = await initDB()
  return await db.get('habits', id)
}

export async function updateHabit(habit) {
  const db = await initDB()
  return await db.put('habits', habit)
}

export async function deleteHabit(id) {
  const db = await initDB()
  await db.delete('habits', id)
  await db.delete('streakState', id)
  // Delete all progress for this habit
  const tx = db.transaction('dailyProgress', 'readwrite')
  const index = tx.store.index('habit_id')
  let cursor = await index.openCursor(id)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
}

// PROGRESS OPERATIONS
export async function getProgress(habitId, date) {
  const db = await initDB()
  return await db.get('dailyProgress', [habitId, date])
}

export async function updateProgress(progressData) {
  const db = await initDB()
  return await db.put('dailyProgress', progressData)
}

export async function getProgressByDate(date) {
  const db = await initDB()
  const index = db.transaction('dailyProgress').store.index('date')
  return await index.getAll(date)
}

export async function getProgressByHabit(habitId) {
  const db = await initDB()
  const index = db.transaction('dailyProgress').store.index('habit_id')
  return await index.getAll(habitId)
}

// STREAK OPERATIONS
export async function getStreakState(habitId) {
  const db = await initDB()
  return await db.get('streakState', habitId)
}

export async function updateStreakState(streakData) {
  const db = await initDB()
  return await db.put('streakState', streakData)
}

export async function getAllStreakStates() {
  const db = await initDB()
  return await db.getAll('streakState')
}
