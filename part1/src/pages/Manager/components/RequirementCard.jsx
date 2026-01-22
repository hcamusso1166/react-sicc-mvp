import { useMemo, useState } from 'react'
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

  return (
    <div className="manager-requirement-card">
      <div className="manager-tree-header">
        <div className="manager-tree-title">
          <h4>Requerimiento: {getDisplayName(requirement)}</h4>
          <span className="muted">
            Estado: {requirement.status || 'Sin estado'}
          </span>
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
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={handleCreateDocuments}
            disabled={creatingDocs || providers.length === 0}
          >
            {creatingDocs ? 'Creando...' : 'Crear Documentos Requeridos'}
          </Button>
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
            documentosByPersona={documentosByPersona}
            documentosByVehiculo={documentosByVehiculo}           
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
}

export default RequirementCard