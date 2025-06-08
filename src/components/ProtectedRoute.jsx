
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const ProtectedRoute = ({ children, requiredRole = null, adminOnly = false }) => {
  const { user, userRole, loading } = useAuth()
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('loading')}</div>
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
