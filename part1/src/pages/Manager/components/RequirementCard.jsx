import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
import ProviderCard from './ProviderCard'

const RequirementCard = ({
  requirement,
  customer,
  site,
  providers,
  documentosByProvider,
  personasByProvider,
  vehiculosByProvider,
  getDisplayName,
  getDocumentoName,
  getPersonName,
  getPersonaDocumento,
  getVehicleName,
  getVehiculoField,
}) => (
  <div className="manager-requirement-card">
    <div className="manager-tree-header">
      <div>
        <h4>Requerimiento: {getDisplayName(requirement)}</h4>
        <p className="muted">Estado: {requirement.status || 'Sin estado'}</p>
      </div>
      <Button
        as={Link}
        to="/clientes/proveedor/nuevo"
        variant="primary"
        size="small"
        state={{ customer, site, requirement }}
      >
        Crear Proveedor +
      </Button>
    </div>
    <div className="manager-provider-section">
      <div className="manager-provider-header">
        <span>Proveedores</span>
        <Button type="button" variant="ghost" size="small">
          Crear Documentos Requerido
        </Button>
      </div>
      {providers.length === 0 && (
        <p className="muted">
          No hay proveedores asociados a este requerimiento.
        </p>
      )}
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          customer={customer}
          site={site}
          requirement={requirement}
          providerDocuments={documentosByProvider[provider.id] || []}
          providerPersonas={personasByProvider[provider.id] || []}
          providerVehiculos={vehiculosByProvider[provider.id] || []}
          getDisplayName={getDisplayName}
          getDocumentoName={getDocumentoName}
          getPersonName={getPersonName}
          getPersonaDocumento={getPersonaDocumento}
          getVehicleName={getVehicleName}
          getVehiculoField={getVehiculoField}
        />
      ))}
    </div>
  </div>
)

export default RequirementCard