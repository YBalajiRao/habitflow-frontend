import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('') // Clear error when user types
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // Validation
    if (formData.password !== formData.password2) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    try {
      console.log('Attempting registration with:', {
        username: formData.username,
        email: formData.email
      })
      
      await register(formData)
      navigate('/')
    } catch (err) {
      console.error('Registration error:', err)
      console.error('Error response:', err.response)
      
      // Show detailed error
      if (err.response?.data) {
        const errorData = err.response.data
        
        if (typeof errorData === 'string') {
          setError(errorData)
        } else if (errorData.email) {
          setError(`Email: ${errorData.email[0]}`)
        } else if (errorData.username) {
          setError(`Username: ${errorData.username[0]}`)
        } else if (errorData.password) {
          setError(`Password: ${errorData.password[0]}`)
        } else if (errorData.detail) {
          setError(errorData.detail)
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0])
        } else {
          setError(JSON.stringify(errorData))
        }
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Start your habit journey today</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., john_doe"
              required 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., john@example.com"
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password (min 8 characters)</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required 
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup