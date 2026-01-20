import { Link, useLocation } from 'react-router-dom'
import Button from '../../components/Button'
import { SuccessBanner } from '../../components/Banner'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'

const SuccessPersona = () => {
  const location = useLocation()
  const customer = location.state?.customer
  const site = location.state?.site
  const requirement = location.state?.requirement
  const provider = location.state?.provider

  const customerName = customer?.name || 'cliente'
  const providerName = provider?.nombre || provider?.razonSocial || 'proveedor'
  const customerId = customer?.id

  return (
    <section className="customers-view">
      <PageHeader
        title="Persona creada"
        subtitle="La persona fue registrada correctamente en el backend."
      />
      <PanelCard>
        <SuccessBanner>Alta de persona registrada con éxito.</SuccessBanner>
        <p className="success-highlight">
          Cliente:&nbsp;<span>{customerName}</span>
        </p>
        <p className="success-highlight">
          Proveedor:&nbsp;<span>{providerName}</span>
        </p>
        <div className="success-actions">
          <Button
            as={Link}
            to={customerId ? `/manager?customerId=${customerId}` : '/manager'}
            variant="primary"
          >
            Volver al manager
          </Button>
          <Button
            as={Link}
            to="/clientes/proveedor/persona/nuevo"
            variant="primary"
            state={{ customer, site, requirement, provider }}
          >
            Crear otra persona
          </Button>
        </div>
      </PanelCard>
    </section>
  )
}

export default SuccessPersona