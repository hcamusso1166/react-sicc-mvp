import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
import { ErrorBanner, SuccessBanner } from '../../../components/Banner'
import PanelCard from '../../../components/PanelCard'
import ProviderCard from './ProviderCard'
import { createProviderRequiredDocuments } from '../../../services/directus'

const RequirementCard = ({
  requirement,
  customer,
  site,
  providers,
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
  const [creatingDocs, setCreatingDocs] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createResult, setCreateResult] = useState(null)
  const [expandedProviders, setExpandedProviders] = useState(() => new Set())

  const providersWithoutDocs = useMemo(
    () =>
      providers.filter(
        (provider) => (documentosByProvider?.[provider.id] || []).length === 0,
      ),
    [providers, documentosByProvider],
  )

   const personasWithoutDocs = useMemo(() => {
    const allPersonas = providers.flatMap(
      (provider) => personasByProvider?.[provider.id] || [],
    )
    return allPersonas.filter(
      (persona) => (documentosByPersona?.[persona.id] || []).length === 0,
    )
  }, [providers, personasByProvider, documentosByPersona])

  const vehiculosWithoutDocs = useMemo(() => {
    const allVehiculos = providers.flatMap(
      (provider) => vehiculosByProvider?.[provider.id] || [],
    )
    return allVehiculos.filter(
      (vehiculo) => (documentosByVehiculo?.[vehiculo.id] || []).length === 0,
    )
  }, [providers, vehiculosByProvider, documentosByVehiculo])

  const handleCreateDocuments = async () => {
    setCreatingDocs(true)
    setCreateError('')
    setCreateResult(null)
    try {
      const result = await createProviderRequiredDocuments({
        providers,
        documentosByProvider,
        personasByProvider,
        vehiculosByProvider,
        documentosByPersona,
        documentosByVehiculo,
      })
      setCreateResult(result)
      if (onDocumentsCreated) {
        await onDocumentsCreated()
      }
    } catch (error) {
      setCreateError(error.message)
    } finally {
      setCreatingDocs(false)
    }
  }

  const toggleProvider = (providerId) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev)
      if (next.has(providerId)) {
        next.delete(providerId)
      } else {
        next.add(providerId)
      }
      return next
    })
  }

  return (
    <div className="manager-requirement-card">
      <div className="manager-requirement-actions">
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={handleCreateDocuments}
          disabled={creatingDocs || providers.length === 0}
        >
          {creatingDocs ? 'Creando...' : 'Crear Documentos Requeridos'}
        </Button>     
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
          
        </div>
        {createError && (
          <PanelCard className="manager-provider-message">
            <ErrorBanner>
              No se pudieron generar los documentos. {createError}
            </ErrorBanner>
            <div className="manager-provider-message-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateError('')}
              >
                Volver
              </Button>
            </div>
          </PanelCard>
        )}
        {createResult && (
          <PanelCard className="manager-provider-message">
            <SuccessBanner>
              Se generaron {createResult.createdProviderDocs} documentos para
              proveedores, {createResult.createdPersonaDocs} para personas y{' '}
              {createResult.createdVehiculoDocs} para vehículos.
            </SuccessBanner>
            <p className="muted">
              Proveedores sin documentos previos: {providersWithoutDocs.length}.
              &nbsp;Personas sin documentos previos: {personasWithoutDocs.length}
              .&nbsp;Vehículos sin documentos previos:{' '}
              {vehiculosWithoutDocs.length}.<br />
              Proveedores omitidos: {createResult.skippedProviders}. Personas
              omitidas: {createResult.skippedPersonas}. Vehículos omitidos:{' '}
              {createResult.skippedVehiculos}.
            </p>
            <div className="manager-provider-message-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateResult(null)}
              >
                Volver
              </Button>
            </div>
          </PanelCard>
        )}
        {providers.length === 0 ? (
          <p className="muted">No existen proveedores registrados.</p>
        ) : (
          <div className="manager-entity-table-wrapper">
            <table className="manager-entity-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>CUIT</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => {
                  const isExpanded = expandedProviders.has(provider.id)
                  return (
                    <Fragment key={provider.id}>
                      <tr>
                        <td>{getDisplayName(provider, 'Proveedor')}</td>
                        <td>{provider.CUIT || '-'}</td>
                        <td>{provider.status || 'Sin estado'}</td>
                        <td>
                          <Button
                            type="button"
                            variant="ghost"
                            size="small"
                            onClick={() => toggleProvider(provider.id)}
                          >
                            {isExpanded ? 'Ocultar' : 'Ver'}
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={4}>
                            <ProviderCard
                              provider={provider}
                              customer={customer}
                              site={site}
                              requirement={requirement}
                              providerDocuments={
                                documentosByProvider[provider.id] || []
                              }
                              documentosByPersona={documentosByPersona}
                              documentosByVehiculo={documentosByVehiculo}
                              providerPersonas={personasByProvider[provider.id] || []}
                              providerVehiculos={
                                vehiculosByProvider[provider.id] || []
                              }
                              onDocumentsUpdated={onDocumentsUpdated}
                              getDisplayName={getDisplayName}
                              getDocumentoName={getDocumentoName}
                              getPersonName={getPersonName}
                              getPersonaDocumento={getPersonaDocumento}
                              getVehicleName={getVehicleName}
                              getVehiculoField={getVehiculoField}
                              showSummary={false}
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

export default RequirementCard