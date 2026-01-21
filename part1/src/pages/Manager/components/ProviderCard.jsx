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

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-AR')
}

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
  const personaCards = providerPersonas.map((persona) => ({
    key: `persona-${persona.id}`,
    title: 'Documentos requeridos Persona',
    meta: `${getPersonName(persona)} · DNI: ${getPersonaDocumento(persona)}`,
    documents: documentosByPersona?.[persona.id] || [],
    tableId: `persona-${persona.id}`,
  }))

  const vehiculoCards = providerVehiculos.map((vehiculo) => ({
    key: `vehiculo-${vehiculo.id}`,
    title: 'Documentos requeridos Vehículo',
    meta: [
      getVehicleName(vehiculo),
      `Dominio: ${getVehiculoField(vehiculo.dominio)}`,
      `Marca: ${getVehiculoField(vehiculo.marca)}`,
      `Modelo: ${getVehiculoField(vehiculo.modelo)}`,
    ]
      .filter(Boolean)
      .join(' · '),
    documents: documentosByVehiculo?.[vehiculo.id] || [],
    tableId: `vehiculo-${vehiculo.id}`,
  }))

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
        {providerPersonas.length === 0 && (
          <div className="manager-subcard">
            <div className="manager-subcard-header">
              <h5>Personas</h5>
            </div>
            <p className="muted">No hay personas registradas.</p>
          </div>
)}
        {providerPersonas.length > 0 &&
          personaCards.map((personaCard) => (
            <DocumentsSubcard
              key={personaCard.key}
              title={personaCard.title}
              meta={personaCard.meta}
              documents={personaCard.documents}
              getDocumentoName={getDocumentoName}
              tableId={personaCard.tableId}
            />
          ))}
        {providerVehiculos.length === 0 && (
          <div className="manager-subcard">
            <div className="manager-subcard-header">
              <h5>Vehículos</h5>
            </div>
            <p className="muted">No hay vehículos registrados.</p>
          </div>
        )}
        {providerVehiculos.length > 0 &&
          vehiculoCards.map((vehiculoCard) => (
            <DocumentsSubcard
              key={vehiculoCard.key}
              title={vehiculoCard.title}
              meta={vehiculoCard.meta}
              documents={vehiculoCard.documents}
              getDocumentoName={getDocumentoName}
              tableId={vehiculoCard.tableId}
            />
          ))}
      </div>
    </div>
  )
}

export default ProviderCard