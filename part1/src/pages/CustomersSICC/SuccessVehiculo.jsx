import { Link, useLocation } from 'react-router-dom'
import { SuccessBanner } from '../../components/Banner'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'

const SuccessVehiculo = () => {
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
        title="Vehículo creado"
        subtitle="El vehículo fue registrado correctamente en el backend."
      />
      <PanelCard>
        <SuccessBanner>Alta de vehículo registrada con éxito.</SuccessBanner>
        <p className="success-highlight">
          Cliente:&nbsp;<span>{customerName}</span>
        </p>
        <p className="success-highlight">
          Proveedor:&nbsp;<span>{providerName}</span>
        </p>
        <div className="success-actions">
          <Link
            to={customerId ? `/manager?customerId=${customerId}` : '/manager'}
            className="primary-button"
          >
            Volver al manager
          </Link>
          <Link
            to="/clientes/proveedor/vehiculo/nuevo"
            className="primary-button"
            state={{ customer, site, requirement, provider }}
          >
            Crear otro vehículo
          </Link>
        </div>
      </PanelCard>
    </section>
  )
}

export default SuccessVehiculo