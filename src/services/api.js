import axios from 'axios'

const API_URL = 'https://habitflow-api-3es3.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Auth API exports
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (userData) => api.post('/users/register/', userData),
  getProfile: () => api.get('/users/me/'),
}

// Habits API exports
export const habitsAPI = {
  getAll: () => api.get('/habits/'),
  create: (habitData) => api.post('/habits/', habitData),
  get: (id) => api.get(/habits/\/),
  update: (id, data) => api.put(/habits/\/, data),
  delete: (id) => api.delete(/habits/\/),
  updateProgress: (id, date, progress) => 
    api.post(/habits/\/update_progress/, { date, progress }),
}

export default api