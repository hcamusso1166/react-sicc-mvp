import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
import PersonList from './PersonList'
import VehicleList from './VehicleList'
import StatusPill from '../../../components/StatusPill'

const statusLabels = {
  toPresent: 'A Presentar',
  presented: 'Presentado',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const getStatusLabel = (status) => {
  if (!status) return 'Sin estado'
  return statusLabels[status] || status.toString().replace(/_/g, ' ')
}

const getStatusClass = (status) => {
  if (!status) return 'manager-documents-status--unknown'
  if (status === 'toPresent') return 'manager-documents-status--pending'
  if (status === 'approved') return 'manager-documents-status--ok'
  if (status === 'rejected') return 'manager-documents-status--danger'
  if (status === 'presented') return 'manager-documents-status--info'
  return 'manager-documents-status--unknown'
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-AR')
}

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
}) => {
  const documentsCount = providerDocuments.length
  const [isDocumentsCollapsed, setIsDocumentsCollapsed] = useState(true)
  const previousDocumentsCount = useRef(documentsCount)

  useEffect(() => {
    if (documentsCount === 0) {
      setIsDocumentsCollapsed(true)
    } else if (previousDocumentsCount.current === 0) {
      setIsDocumentsCollapsed(true)
    }
    previousDocumentsCount.current = documentsCount
  }, [documentsCount])

  const sortedDocuments = useMemo(() => {
    const documents = [...providerDocuments]
    const compareValues = (a, b) => {
      if (a == null && b == null) return 0
      if (a == null) return 1
      if (b == null) return -1
      if (a > b) return 1
      if (a < b) return -1
      return 0
    }
    const getDocumentoDisplayName = (documento) =>
      getDocumentoName(documento) || 'Documento'
    const getValidez = (documento) =>
      documento?.validezDias ??
      documento?.tipoDocumento?.validezDocumentoDias ??
      null

    return documents.sort((a, b) => {
      const dateA = a?.proximaFechaPresentacion
        ? new Date(a.proximaFechaPresentacion).getTime()
        : null
      const dateB = b?.proximaFechaPresentacion
        ? new Date(b.proximaFechaPresentacion).getTime()
        : null
      const dateCompare = compareValues(dateA, dateB)
      if (dateCompare !== 0) return dateCompare

      const validezCompare = compareValues(getValidez(a), getValidez(b))
      if (validezCompare !== 0) return validezCompare

      return getDocumentoDisplayName(a).localeCompare(
        getDocumentoDisplayName(b),
        'es',
        { sensitivity: 'base' },
      )
    })
  }, [providerDocuments, getDocumentoName])

  const toggleDocuments = () => {
    setIsDocumentsCollapsed((prevState) => !prevState)
  }

  const documentsTableId = `provider-documents-${provider?.id ?? 'unknown'}`

  return (
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
 <div className="manager-provider-subcards">
        <div className="manager-subcard">
          <div className="manager-subcard-header">
            <h5>Documentos a Presentar</h5>
            {documentsCount > 0 && (
              <Button
                variant="ghost"
                size="small"
                onClick={toggleDocuments}
                aria-expanded={!isDocumentsCollapsed}
                aria-controls={documentsTableId}
              >
                {isDocumentsCollapsed ? 'Ver documentos' : 'Plegar documentos'}
              </Button>
            )}
          </div>
          {documentsCount === 0 && (
            <p className="muted">No hay documento para presentar.</p>
          )}
          {documentsCount > 0 && isDocumentsCollapsed && (
            <p className="muted">
              {documentsCount === 1
                ? 'Hay 1 documento para presentar.'
                : `Hay ${documentsCount} documentos para presentar.`}
            </p>
          )}
          {documentsCount > 0 && !isDocumentsCollapsed && (
            <div
              className="manager-documents-table-wrapper"
              id={documentsTableId}
            >
              <table className="manager-documents-table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Tipo</th>
                    <th>Documento</th>
                    <th>Fecha Pres.</th>
                    <th>Validez</th>
                    <th>Próxima</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDocuments.map((documento) => {
                    const validez =
                      documento?.validezDias ??
                      documento?.tipoDocumento?.validezDocumentoDias ??
                      null
                    const documentoName = getDocumentoName(documento)
                    return (
                      <tr key={documento.id}>
                        <td>
                          <StatusPill
                            className={[
                              'manager-documents-status',
                              getStatusClass(documento?.status),
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {getStatusLabel(documento?.status)}
                          </StatusPill>
                        </td>
                        <td>{documento?.idParametro ?? '-'}</td>
                        <td>{documentoName}</td>
                        <td>{formatDate(documento?.fechaPresentacion)}</td>
                        <td>{validez ?? '-'}</td>
                        <td>
                          {formatDate(documento?.proximaFechaPresentacion)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
}

export default ProviderCard
