import Button from '../../components/Button'

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-screen">
      <header className="login-header">
        <div className="logo">SICC</div>
      </header>
      <div className="login-card">
        <div className="login-copy">
          <h1>Bienvenido a SICC. Sistema Integral de Control de Contratistas.</h1>
          <p>Inicia sesión para acceder al panel de gestión documental.</p>
          <Button type="button" variant="primary" onClick={onLogin}>
            Entrar al Dashboard
          </Button>
        </div>
        <div className="login-illustration">
          <div className="login-mockup" />
        </div>
      </div>
    </div>
  )
}

export default LoginPage