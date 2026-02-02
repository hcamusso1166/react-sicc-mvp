import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Button from '../../components/Button'
import { useAuth } from '../../auth/AuthContext'

const getErrorCopy = (message) => {
  if (!message) return 'Ocurrió un error inesperado.'
  const lower = message.toLowerCase()
  if (lower.includes('invalid') || lower.includes('credenciales')) {
    return 'Credenciales inválidas. Revisa tu email y contraseña.'
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'No se pudo conectar con el servidor. Intenta nuevamente.'
  }
  return message
}

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login({ email, password })
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorCopy(err?.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-screen">
      <header className="login-header">
        <div className="logo">SICC</div>
      </header>
      <div className="login-card">
        <div className="login-copy">
          <h1>Bienvenido a SICC. Sistema Integral de Control de Contratistas.</h1>
          <p>Inicia sesión para acceder al panel de gestión documental.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                required
              />
            </label>
            <label className="login-field">
              <span>Contraseña</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            {error ? <div className="login-error">{error}</div> : null}
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
        <div className="login-illustration">
          <div className="login-mockup" />
        </div>
      </div>
    </div>
  )
}

export default LoginPage