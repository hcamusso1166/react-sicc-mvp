import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

const PublicRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="auth-loading">
        <p>Cargando sesión...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/'
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default PublicRoute