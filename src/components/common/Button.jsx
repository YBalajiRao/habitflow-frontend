import React from 'react'

function Button({ children, variant = 'primary', size = 'medium', onClick, disabled, type = 'button' }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
