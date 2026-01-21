import SiteCard from './SiteCard'

const ManagerTree = ({
  customer,
  sites,
  requirementsBySite,
  providersByRequirement,
  documentosByProvider,
  documentosByPersona,
  documentosByVehiculo,
  personasByProvider,
  vehiculosByProvider,
  onDocumentsCreated,
  getDisplayName,
  getDocumentoName,
  getPersonName,
  getPersonaDocumento,
  getVehicleName,
  getVehiculoField,
}) => (
  <div className="manager-tree">
    {sites.map((site) => (
      <SiteCard
        key={site.id}
        site={site}
        customer={customer}
        requirements={requirementsBySite[site.id] || []}
        providersByRequirement={providersByRequirement}
        documentosByProvider={documentosByProvider}
        documentosByPersona={documentosByPersona}
        documentosByVehiculo={documentosByVehiculo}
        personasByProvider={personasByProvider}
        vehiculosByProvider={vehiculosByProvider}
        onDocumentsCreated={onDocumentsCreated}
        getDisplayName={getDisplayName}
        getDocumentoName={getDocumentoName}
        getPersonName={getPersonName}
        getPersonaDocumento={getPersonaDocumento}
        getVehicleName={getVehicleName}
        getVehiculoField={getVehiculoField}
      />
    ))}
  </div>
)

export default ManagerTree