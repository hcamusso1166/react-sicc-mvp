import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'

const SuccessCustomer = () => {
    const location = useLocation()
  const customer = location.state?.customer
  const customerName = customer?.name || 'cliente'

  return (
    <section className="customers-view">
      <PageHeader
        title="Cliente creado"
        subtitle="El cliente fue registrado correctamente en el backend."
      />
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