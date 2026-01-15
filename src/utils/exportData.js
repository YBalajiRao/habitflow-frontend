import { habitsAPI } from '../services/api'

export async function exportAllData() {
  try {
    const response = await habitsAPI.getAll()
    const habits = response.data

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      habits: habits
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Export failed:', error)
    return false
  }
}