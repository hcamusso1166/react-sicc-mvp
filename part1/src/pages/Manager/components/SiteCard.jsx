import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
import RequirementCard from './RequirementCard'

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-AR')
}

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
}) => {
  const [expandedRequirements, setExpandedRequirements] = useState(new Set())
  const [requirementSearch, setRequirementSearch] = useState('')

  const toggleRequirement = (requirementId) => {
    setExpandedRequirements((prev) => {
      const next = new Set(prev)
      if (next.has(requirementId)) {
        next.delete(requirementId)
      } else {
        next.add(requirementId)
      }
      return next
    })
  }

    const normalizedRequirementSearch = requirementSearch.trim().toLowerCase()
  const filteredRequirements = requirements.filter((requirement) => {
    if (!normalizedRequirementSearch) return true
    const name = getDisplayName(requirement, 'Requerimiento')
      .toString()
      .toLowerCase()
    const status = (requirement.status || '').toString().toLowerCase()
    return (
      name.includes(normalizedRequirementSearch) ||
      status.includes(normalizedRequirementSearch)
    )
  })

  return (
    <div className="manager-tree-card">
      <div className="manager-tree-body">
        <div className="manager-tree-subheader">
          <div className="manager-tree-title">
            <h4>Requerimientos</h4>
            <div className="manager-subcard-search">
              <input
                type="search"
                placeholder="Buscar requerimientos"
                value={requirementSearch}
                onChange={(event) => setRequirementSearch(event.target.value)}
                aria-label="Buscar requerimientos"
              />
            </div>
          </div>
          <div className="manager-tree-actions">
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
        </div>
        {requirements.length === 0 ? (
          <p className="muted">No hay requerimientos registrados para este site.</p>
        ) : filteredRequirements.length === 0 ? (
          <p className="muted">No hay requerimientos que coincidan con el filtro.</p>
        ) : (
          <div className="manager-entity-table-wrapper">
            <table className="manager-entity-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Proyectada Fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((requirement) => {
                  const isExpanded = expandedRequirements.has(requirement.id)
                  return (
                    <Fragment key={requirement.id}>
                      <tr>
                        <td>
                          <span
                            className={`manager-entity-name${isExpanded ? ' manager-entity-name--expanded' : ''}`}
                          >
                            {getDisplayName(requirement, 'Requerimiento')}
                          </span>
                        </td>
                        <td>{formatDate(requirement.fechaInicio)}</td>
                        <td>{formatDate(requirement.fechaProyectadaFin)}</td>
                        <td>{requirement.status || 'Sin estado'}</td>
                        <td>
                          <Button
                            type="button"
                            variant="ghost"
                            size="small"
                            onClick={() => toggleRequirement(requirement.id)}
                          >
                            {isExpanded ? 'Ocultar' : 'Ver'}
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5}>
                            <RequirementCard
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
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  )
}

export default SiteCard