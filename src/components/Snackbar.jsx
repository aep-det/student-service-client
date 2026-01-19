import { useEffect } from 'react'

export function Snackbar({ open, message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [open, duration, onClose])

  if (!open) return null

  return (
    <div className={`snackbar snackbar-${type}`} role="alert">
      <div className="snackbar-content">
        <span className="snackbar-message">{message}</span>
        <button className="snackbar-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  )
}
