import React, { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../services/api'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 < Date.now()) {
          logout()
        } else {
          const response = await authAPI.getProfile()
          setUser(response.data)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
      }
    }
    setLoading(false)
  }

  async function login(email, password) {
    try {
      console.log('Logging in with:', email)
      const response = await authAPI.login(email, password)
      const { access, refresh } = response.data
      
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      
      const profile = await authAPI.getProfile()
      setUser(profile.data)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function register(userData) {
    try {
      console.log('Registering user:', userData.email)
      const response = await authAPI.register(userData)
      console.log('Registration response:', response.data)
      
      // Auto login after register
      return await login(userData.email, userData.password)
    } catch (error) {
      console.error('Registration failed:', error)
      console.error('Error data:', error.response?.data)
      throw error
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)