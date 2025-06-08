
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRole = null, adminOnly = false }) => {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
