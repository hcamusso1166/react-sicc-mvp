import { Link, useLocation } from 'react-router-dom'

const SuccessCustomer = () => {
    const location = useLocation()
  const customer = location.state?.customer
  const customerName = customer?.name || 'cliente'

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
          <p className="success-highlight">
            Cliente:&nbsp;<span>{customerName}</span>
          </p>
        <div className="success-actions">
          <Link to="/clientes" className="primary-button">
            Volver
          </Link>
          <Link
            to="/clientes/site/nuevo"
            className="primary-button"
            state={{ customer }}
          >
            Crear SITE
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SuccessCustomer