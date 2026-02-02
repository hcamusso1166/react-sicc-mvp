import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
import RequirementCard from './RequirementCard'

const SiteCard = ({
  site,
  customer,
  requirements,
  providersByRequirement,
  documentosByProvider,
  documentosByPersona,
  documentosByVehiculo,
  personasByProvider,
  vehiculosByProvider,
  onDocumentsCreated,
  onDocumentsUpdated,
  getDisplayName,
  getDocumentoName,
  getPersonName,
  getPersonaDocumento,
  getVehicleName,
  getVehiculoField,
}) => (
  <div className="manager-tree-card">
    <div className="manager-tree-header">
      <div className="manager-tree-title">
        <h3>Site: {getDisplayName(site)}</h3>
        <span className="muted">
          Estado: {site.status || 'Sin estado'}
        </span>
      </div>
      <Button
        as={Link}
        to="/clientes/site/requerimiento/nuevo"
        variant="primary"
        size="small"
        state={{ customer, site }}
      >
        Crear Requerimiento +
      </Button>
    </div>
    <div className="manager-tree-body">
      {requirements.length === 0 && (
        <p className="muted">No hay requerimientos registrados para este site.</p>
      )}
      {requirements.map((requirement) => (
        <RequirementCard
          key={requirement.id}
          requirement={requirement}
          customer={customer}
          site={site}
          providers={providersByRequirement[requirement.id] || []}
          documentosByProvider={documentosByProvider}
          documentosByPersona={documentosByPersona}
          documentosByVehiculo={documentosByVehiculo}
          personasByProvider={personasByProvider}
          vehiculosByProvider={vehiculosByProvider}
          onDocumentsCreated={onDocumentsCreated}
          onDocumentsUpdated={onDocumentsUpdated}
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

export default SiteCard