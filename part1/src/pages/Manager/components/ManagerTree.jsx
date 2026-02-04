import { Fragment, useState } from 'react'
import Button from '../../../components/Button'
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
  onDocumentsUpdated,
  getDisplayName,
  getDocumentoName,
  getPersonName,
  getPersonaDocumento,
  getVehicleName,
  getVehiculoField,
}) => {
  const [expandedSites, setExpandedSites] = useState(new Set())

const toggleSite = (siteId) => {
    setExpandedSites((prev) => {
      const next = new Set(prev)
      if (next.has(siteId)) {
        next.delete(siteId)
      } else {
        next.add(siteId)
      }
      return next
    })
  }

  return (
    <div className="manager-tree">
      <div className="manager-entity-table-wrapper">
        <table className="manager-entity-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => {
              const isExpanded = expandedSites.has(site.id)
              return (
                <Fragment key={site.id}>
                  <tr>
                    <td>
                      <span
                        className={`manager-entity-name${isExpanded ? ' manager-entity-name--expanded' : ''}`}
                      >
                        {getDisplayName(site, 'Site')}
                      </span>
                    </td>
                    <td>{site.status || 'Sin estado'}</td>
                    <td>
                      <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        onClick={() => toggleSite(site.id)}
                      >
                        {isExpanded ? 'Ocultar' : 'Ver'}
                      </Button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={3}>
                        <SiteCard
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
                          onDocumentsUpdated={onDocumentsUpdated}
                          getDisplayName={getDisplayName}
                          getDocumentoName={getDocumentoName}
                          getPersonName={getPersonName}
                          getPersonaDocumento={getPersonaDocumento}
                          getVehicleName={getVehicleName}
                          getVehiculoField={getVehiculoField}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManagerTree