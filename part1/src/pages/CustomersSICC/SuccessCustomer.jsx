import { Link } from 'react-router-dom'

const SuccessCustomer = () => {
  return (
    <section className="customers-view">
      <header className="dashboard-header">
        <div>
          <h2>Cliente creado</h2>
          <p className="muted">
            El cliente fue registrado correctamente en el backend.
          </p>
        </div>
      </header>
      <div className="panel-card">
        <div className="success-banner">Alta del Cliente registrada con éxito.</div>
        <div className="success-actions">
          <Link to="/clientes" className="primary-button">
            Volver
          </Link>
          <Link to="/manager" className="primary-button">
            Crear SITE
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SuccessCustomer