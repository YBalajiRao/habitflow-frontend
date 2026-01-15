import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const API_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auto-attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken
        })
        
        const { access } = response.data
        localStorage.setItem('access_token', access)
        
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (userData) => api.post('/users/register/', userData),
  getProfile: () => api.get('/users/me/'),
}

export const habitsAPI = {
  getAll: () => api.get('/habits/'),
  create: (habitData) => api.post('/habits/', habitData),
  get: (id) => api.get(`/habits/${id}/`),
  update: (id, data) => api.put(`/habits/${id}/`, data),
  delete: (id) => api.delete(`/habits/${id}/`),
  updateProgress: (id, date, progress) => 
    api.post(`/habits/${id}/update_progress/`, { date, progress }),
}

export default api