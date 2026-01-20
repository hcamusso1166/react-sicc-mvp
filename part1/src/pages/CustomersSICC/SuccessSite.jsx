import { Link, useLocation } from 'react-router-dom'
import Button from '../../components/Button'
import { SuccessBanner } from '../../components/Banner'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'

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
      <PanelCard>
        <SuccessBanner>Alta del Site registrada con éxito.</SuccessBanner>
        <p className="success-highlight">
          Cliente:&nbsp;<span>{customerName}</span>
        </p>
        <p className="success-highlight">
          Site:&nbsp;<span>{siteName}</span>
        </p>
        <div className="success-actions">
          <Button as={Link} to="/clientes" variant="primary">
            Volver al listado
          </Button>
          <Button
            as={Link}
            to="/clientes/site/nuevo"
            variant="primary"
            state={{ customer }}
          >
            Crear otro Site
          </Button>
          <Button
            as={Link}
            to="/clientes/site/requerimiento/nuevo"
            variant="primary"
            state={{ customer, site }}
          >
            Crear Requerimiento
          </Button>
        </div>
      </PanelCard>
    </section>
  )
}

export default SuccessSite