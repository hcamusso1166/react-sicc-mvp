import { Link, useLocation, useNavigate } from 'react-router-dom'

const SuccessSite = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const customer = location.state?.customer
  const site = location.state?.site
  const customerName = customer?.name || 'cliente'
  const siteName = site?.nombre || 'site'

  return (
    <section className="customers-view">
      <header className="dashboard-header">
        <div>
          <h2>Site creado</h2>
          <p className="muted">El Site fue registrado correctamente.</p>
        </div>
      </header>
      <div className="panel-card">
        <div className="success-banner">Alta del Site registrada con éxito.</div>
        <p className="success-highlight">
          Cliente:&nbsp;<span>{customerName}</span>
        </p>
        <p className="success-highlight">
          Site:&nbsp;<span>{siteName}</span>
        </p>
        <div className="success-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(-1)}
          >
            Volver atrás
          </button>
          <Link
            to="/clientes/site/nuevo"
            className="primary-button"
            state={{ customer }}
          >
            Crear otro Site
          </Link>
          <Link
            to="/clientes/site/requerimiento/nuevo"
            className="primary-button"
            state={{ customer, site }}
          >
            Crear Requerimiento
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SuccessSite