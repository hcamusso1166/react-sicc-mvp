import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'

const SuccessSite = () => {
  const location = useLocation()
  const customer = location.state?.customer
  const site = location.state?.site
  const customerName = customer?.name || 'cliente'
  const siteName = site?.nombre || 'site'

  return (
    <section className="customers-view">
      <PageHeader
        title="Site creado"
        subtitle="El Site fue registrado correctamente."
      />
      <div className="panel-card">
        <div className="success-banner">Alta del Site registrada con éxito.</div>
        <p className="success-highlight">
          Cliente:&nbsp;<span>{customerName}</span>
        </p>
        <p className="success-highlight">
          Site:&nbsp;<span>{siteName}</span>
        </p>
        <div className="success-actions">
          <Link to="/clientes" className="primary-button">
            Volver al listado
          </Link>
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