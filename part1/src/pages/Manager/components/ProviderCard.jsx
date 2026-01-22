import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
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

const getEntityStatusLabel = (status) => {
  if (!status) return 'Sin estado'
  return status.toString().replace(/_/g, ' ')
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-AR')
}

const documentActions = [
  {
    label: 'Cargar Archivo',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3v10m0 0 3.5-3.5M12 13 8.5 9.5M4 16.5v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    label: 'Aprobar',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12.5l4.2 4.2L19 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    label: 'Editar',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 20h4l9-9a2.1 2.1 0 0 0-4-4l-9 9v4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    label: 'Visualizar',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M2.5 12s3.7-6 9.5-6 9.5 6 9.5 6-3.7 6-9.5 6-9.5-6-9.5-6Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx="12"
          cy="12"
          r="2.8"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
    ),
  },
  {
    label: 'Borrar',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 7h12M9 7V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5V7m-7 0 1 12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2l1-12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
]

const DocumentsSubcard = ({
  title,
  documents,
  getDocumentoName,
  tableId,
  meta,
  emptyLabel = 'No hay documento para presentar.',
}) => {
  const documentsCount = documents.length
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
    const documentsCopy = [...documents]
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

    return documentsCopy.sort((a, b) => {
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
  }, [documents, getDocumentoName])

  const toggleDocuments = () => {
    setIsDocumentsCollapsed((prevState) => !prevState)
  }

  const documentsTableId = `documents-${tableId}`

  return (
    <div className="manager-subcard">
      <div className="manager-subcard-header">
        <h5>{title}</h5>
        {meta && <span className="muted">{meta}</span>}
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
      {documentsCount === 0 && <p className="muted">{emptyLabel}</p>}
      {documentsCount > 0 && isDocumentsCollapsed && (
        <p className="muted">
          {documentsCount === 1
            ? 'Hay 1 documento para presentar.'
            : `Hay ${documentsCount} documentos para presentar.`}
        </p>
      )}
      {documentsCount > 0 && !isDocumentsCollapsed && (
        <div className="manager-documents-table-wrapper" id={documentsTableId}>
          <table className="manager-documents-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Fecha Pres.</th>
                <th>Validez</th>
                <th>Próxima</th>
                <th className="manager-documents-actions-head">Acciones</th>
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
                    <td>{formatDate(documento?.proximaFechaPresentacion)}</td>
                                        <td>
                      <div className="manager-documents-actions">
                        {documentActions.map((action) => (
                          <button
                            key={`${documento.id}-${action.label}`}
                            type="button"
                            className="manager-documents-action-button"
                            title={action.label}
                            aria-label={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const ProviderCard = ({
  provider,
  customer,
  site,
  requirement,
  providerDocuments,
  documentosByPersona,
  documentosByVehiculo,
  providerPersonas,
  providerVehiculos,
  getDisplayName,
  getDocumentoName,
  getPersonName,
  getPersonaDocumento,
  getVehicleName,
  getVehiculoField,
}) => {
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
        <DocumentsSubcard
          title="Documentos a Presentar"
          documents={providerDocuments}
          getDocumentoName={getDocumentoName}
          tableId={`provider-${provider?.id ?? 'unknown'}`}
        />
<div className="manager-subcard manager-subcard-group">
          <div className="manager-subcard-header">
            <h5>Personas</h5>
            <span className="muted">
              {providerPersonas.length === 1
                ? '1 registrada'
                : `${providerPersonas.length} registradas`}
            </span>
          </div>
{providerPersonas.length === 0 && (
            <p className="muted">No hay personas registradas.</p>
          )}
          {providerPersonas.length > 0 && (
            <div className="manager-subcard-group-content">
              {providerPersonas.map((persona) => (
                <div
                  className="manager-subcard manager-subcard-item"
                  key={`persona-${persona.id}`}
                >
                  <div className="manager-subcard-header">
                    <h5>Persona</h5>
                    <span className="muted">
                      {getPersonName(persona)} · DNI:{' '}
                      {getPersonaDocumento(persona)}
                    </span>
                    <span className="muted">
                      Estado: {getEntityStatusLabel(persona?.status)}
                    </span>
                  </div>
                  <DocumentsSubcard
                    title="Documentos a Presentar"
                    documents={documentosByPersona?.[persona.id] || []}
                    getDocumentoName={getDocumentoName}
                    tableId={`persona-${persona.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="manager-subcard manager-subcard-group">
          <div className="manager-subcard-header">
            <h5>Vehículos</h5>
            <span className="muted">
              {providerVehiculos.length === 1
                ? '1 registrado'
                : `${providerVehiculos.length} registrados`}
            </span>
          </div>
{providerVehiculos.length === 0 && (
            <p className="muted">No hay vehículos registrados.</p>
          )}
          {providerVehiculos.length > 0 && (
            <div className="manager-subcard-group-content">
              {providerVehiculos.map((vehiculo) => (
                <div
                  className="manager-subcard manager-subcard-item"
                  key={`vehiculo-${vehiculo.id}`}
                >
                  <div className="manager-subcard-header">
                    <h5>Vehículo</h5>
                    <span className="muted">
                      {getVehicleName(vehiculo)} · Dominio:{' '}
                      {getVehiculoField(vehiculo.dominio)}
                    </span>
                    <span className="muted">
                      Marca: {getVehiculoField(vehiculo.marca)} · Modelo:{' '}
                      {getVehiculoField(vehiculo.modelo)}
                    </span>
                    <span className="muted">
                      Estado: {getEntityStatusLabel(vehiculo?.status)}
                    </span>
                  </div>
                  <DocumentsSubcard
                    title="Documentos a Presentar"
                    documents={documentosByVehiculo?.[vehiculo.id] || []}
                    getDocumentoName={getDocumentoName}
                    tableId={`vehiculo-${vehiculo.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderCard