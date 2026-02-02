import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="auth-loading">
        <p>Cargando sesión...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute