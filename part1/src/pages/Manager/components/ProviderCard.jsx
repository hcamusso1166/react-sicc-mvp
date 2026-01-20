import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
import PersonList from './PersonList'
import VehicleList from './VehicleList'

const ProviderCard = ({
  provider,
  customer,
  site,
  requirement,
  providerDocuments,
  providerPersonas,
  providerVehiculos,
  getDisplayName,
  getDocumentoName,
  getPersonName,
  getPersonaDocumento,
  getVehicleName,
  getVehiculoField,
}) => (
  <div className="manager-provider-card">
    <div className="manager-provider-top">
      <div className="manager-provider-summary">
        <strong>{getDisplayName(provider)}</strong>
        <span className="muted">CUIT: {provider.CUIT || '-'}</span>
        <span className="muted">
          Estado: {provider.status || 'Sin estado'}
        </span>
      </div>
      <div className="manager-provider-actions">
        <Button
          as={Link}
          to="/clientes/proveedor/persona/nuevo"
          variant="primary"
          size="small"
          state={{ customer, site, requirement, provider }}
        >
          Crear Persona +
        </Button>
        <Button
          as={Link}
          to="/clientes/proveedor/vehiculo/nuevo"
          variant="primary"
          size="small"
          state={{ customer, site, requirement, provider }}
        >
          Crear Vehículo +
        </Button>
      </div>
    </div>
    <div className="manager-provider-documents">
      <h5>Documentos requeridos</h5>
      {providerDocuments.length === 0 && (
        <p className="muted">No hay documentos cargados.</p>
      )}
      {providerDocuments.length > 0 && (
        <ul>
          {providerDocuments.map((documento) => (
            <li key={documento.id}>{getDocumentoName(documento)}</li>
          ))}
        </ul>
      )}
    </div>
    <div className="manager-provider-subcards">
      <div className="manager-subcard">
        <div className="manager-subcard-header">
          <h5>Personas</h5>
        </div>
        <PersonList
          personas={providerPersonas}
          getPersonName={getPersonName}
          getPersonaDocumento={getPersonaDocumento}
        />
      </div>
      <div className="manager-subcard">
        <div className="manager-subcard-header">
          <h5>Vehículos</h5>
        </div>
        <VehicleList
          vehiculos={providerVehiculos}
          getVehicleName={getVehicleName}
          getVehiculoField={getVehiculoField}
        />
      </div>
    </div>
  </div>
)

export default ProviderCard