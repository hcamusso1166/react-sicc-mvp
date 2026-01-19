import { Link, useLocation } from 'react-router-dom'
import { SuccessBanner } from '../../components/Banner'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'

const SuccessRequerimient = () => {
  const location = useLocation()
  const customer = location.state?.customer
  const site = location.state?.site
  const requirement = location.state?.requirement
  const customerName = customer?.name || 'cliente'
  const siteName = site?.nombre || 'site'
  const requirementName = requirement?.nombre || 'requerimiento'

  return (
    <section className="customers-view">
      <PageHeader
        title="Requerimiento creado"
        subtitle="El requerimiento fue registrado correctamente en el backend."
      />
      <PanelCard>
        <SuccessBanner>
          Alta del Requerimiento registrada con éxito.
        </SuccessBanner>
        <p className="success-highlight">
          Cliente:&nbsp;<span>{customerName}</span>
        </p>
        <p className="success-highlight">
          Site:&nbsp;<span>{siteName}</span>
        </p>
        <p className="success-highlight">
          Requerimiento:&nbsp;<span>{requirementName}</span>
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
            Crear otro Requerimiento
          </Link>
        </div>
      </PanelCard>
    </section>
  )
}

export default SuccessRequerimient