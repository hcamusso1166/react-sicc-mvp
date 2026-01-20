import SiteCard from './SiteCard'

const ManagerTree = ({
  customer,
  sites,
  requirementsBySite,
  providersByRequirement,
  documentosByProvider,
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