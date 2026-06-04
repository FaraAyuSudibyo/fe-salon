import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export function RequireAdmin({ children }) {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!isAdmin)    return <Navigate to="/unauthorized" replace />
  return children
}

export function RequireCustomer({ children }) {
  const { isLoggedIn, isCustomer } = useAuth()
  if (!isLoggedIn)  return <Navigate to="/login" replace />
  if (!isCustomer)  return <Navigate to="/unauthorized" replace />
  return children
}

export function RedirectIfLoggedIn({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children
}
