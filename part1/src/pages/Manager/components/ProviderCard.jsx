import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/Button'
import StatusPill from '../../../components/StatusPill'
import {
  getDirectusFileUploadUrl,
  updateProviderDocument,
  updateProviderDocumentFile,
  updateProviderDocumentStatus,
  uploadDirectusFile,
} from '../../../services/directus'
import { request } from '../../../services/directusClient'

const statusLabels = {
  toPresent: 'A Presentar',
  presented: 'Presentado',
  approved: 'Aprobado',
  archived: 'Archivado',
  finalized: 'Vencido',
  rejected: 'Rechazado',
}

const getStatusLabel = (status) => {
  if (!status) return 'Sin estado'
  return statusLabels[status] || status.toString().replace(/_/g, ' ')
}

const getStatusClass = (status) => {
  if (!status) return 'manager-documents-status--unknown'
  if (status === 'toPresent') return 'manager-documents-status--to-present'
  if (status === 'presented') return 'manager-documents-status--presented'
  if (status === 'approved') return 'manager-documents-status--approved'
  if (status === 'archived') return 'manager-documents-status--archived'
  if (status === 'finalized') return 'manager-documents-status--finalized'
  if (status === 'rejected') return 'manager-documents-status--rejected'
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

const ACTIONS = [
  { key: 'upload', label: 'Cargar Archivo', icon: (
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
    )},
  { key: 'view', label: 'Visualizar', icon: (
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
    ) },
  { key: 'edit', label: 'Editar', icon: (
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
    ) },
  { key: 'approve', label: 'Aprobar', icon: (
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
    ) },
  { key: 'delete', label: 'Borrar', icon: (
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
    ) },
]

const ACTIONS_BY_STATUS = {
  toPresent: ['upload', 'delete'],
  presented: ['view', 'edit', 'approve'],
  approved: ['view'],
  archived: [],
  finalized: [],
  rejected: ['view'],
}

const DocumentsSubcard = ({
  title,
  documents,
  getDocumentoName,
  tableId,
  meta,
  emptyLabel = 'No hay documento para presentar.',
  showActions = false,
  collapsible = true,
  defaultCollapsed = true,
  onUploadDocument,
  onDeleteDocument,
  onViewDocument,
  onEditDocument,
  onApproveDocument,
}) => {
  const documentsCount = documents.length
  const [isDocumentsCollapsed, setIsDocumentsCollapsed] = useState(
    defaultCollapsed,
  )
  const previousDocumentsCount = useRef(documentsCount)

  useEffect(() => {
    if (documentsCount === 0) {
      setIsDocumentsCollapsed(true)
    } else if (previousDocumentsCount.current === 0) {
      setIsDocumentsCollapsed(defaultCollapsed)
    }
    previousDocumentsCount.current = documentsCount
  }, [documentsCount, defaultCollapsed])

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
        {documentsCount > 0 && collapsible && (
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
      {documentsCount > 0 && collapsible && isDocumentsCollapsed && (
        <p className="muted">
          {documentsCount === 1
            ? 'Hay 1 documento para presentar.'
            : `Hay ${documentsCount} documentos para presentar.`}
        </p>
      )}
      {documentsCount > 0 && (!collapsible || !isDocumentsCollapsed) && (
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
                {showActions && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {sortedDocuments.map((documento) => {
                const validez =
                  documento?.validezDias ??
                  documento?.tipoDocumento?.validezDocumentoDias ??
                  null
                const documentoName = getDocumentoName(documento)
                const allowedActions =
                  ACTIONS_BY_STATUS[documento?.status] || []
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
                    {showActions && (
                      <td>
                        <div className="manager-documents-actions">
                          {ACTIONS.map((action) => {
                            if (!allowedActions.includes(action.key)) {
                              return (
                                <span
                                  key={action.key}
                                  className="manager-documents-action-placeholder"
                                  aria-hidden="true"
                                />
                              )
                            }

                            const isUpload = action.key === 'upload'
                            const isDelete = action.key === 'delete'
                            const isView = action.key === 'view'
                            const isEdit = action.key === 'edit'
                            const isApprove = action.key === 'approve'
                            const handler = isUpload
                              ? () => onUploadDocument?.(documento)
                              : isDelete
                                ? () => onDeleteDocument?.(documento)
                              : isView
                                ? () => onViewDocument?.(documento)
                              : isEdit
                                ? () => onEditDocument?.(documento)
                              : isApprove
                                ? () => onApproveDocument?.(documento)
                              : null
                            const isDisabled = !handler
                            return (
                              <button
                                key={action.key}
                                type="button"
                                className="manager-documents-action-button"
                                onClick={handler || undefined}
                                disabled={isDisabled}
                                title={
                                  isDisabled ? 'Próximamente' : action.label
                                }
                                aria-label={action.label}
                              >
                                <span aria-hidden="true">{action.icon}</span>
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    )}
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
  onDocumentsUpdated,
  getDisplayName,
  getDocumentoName,
  getPersonName,
  getPersonaDocumento,
  getVehicleName,
  getVehiculoField,
  showSummary = true,
}) => {
  const [uploadTarget, setUploadTarget] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [viewTarget, setViewTarget] = useState(null)
  const [viewDocumentUrl, setViewDocumentUrl] = useState('')
  const [viewDocumentError, setViewDocumentError] = useState('')
  const [isLoadingViewDocument, setIsLoadingViewDocument] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editValues, setEditValues] = useState({
    fechaPresentacion: '',
    proximaFechaPresentacion: '',
    validezDias: '',
  })
  const [editFile, setEditFile] = useState(null)
  const [editError, setEditError] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [personaSearch, setPersonaSearch] = useState('')
  const [vehiculoSearch, setVehiculoSearch] = useState('')
  const [expandedPersonas, setExpandedPersonas] = useState(() => new Set())
  const [expandedVehiculos, setExpandedVehiculos] = useState(() => new Set())
  const uploadEndpoint = useMemo(() => getDirectusFileUploadUrl(), [])
  const normalizeSearchValue = (value) =>
    (value == null ? '' : String(value)).trim().toLowerCase()

  const modalTitle = useMemo(() => {
    const parts = [
      getDisplayName(customer, 'Cliente'),
      getDisplayName(site, 'Site'),
      getDisplayName(requirement, 'Requerimiento'),
      getDisplayName(provider, 'Proveedor'),
    ]
    return parts.filter(Boolean).join('-')
  }, [customer, site, requirement, provider, getDisplayName])

  const closeUploadModal = () => {
    setUploadTarget(null)
    setSelectedFile(null)
    setUploadError('')
    setIsUploading(false)
  }
  const closeViewModal = () => {
    setViewTarget(null)
    setViewDocumentError('')
  }
  const closeEditModal = () => {
    if (viewTarget?.id === editTarget?.id) {
      setViewTarget(null)
      setViewDocumentUrl('')
      setViewDocumentError('')
    }
    setEditTarget(null)
    setEditFile(null)
    setEditError('')
    setIsSavingEdit(false)
  }

  const openUploadModal = (documento) => {
    setUploadTarget(documento)
    setSelectedFile(null)
    setUploadError('')
  }
const openViewModal = (documento) => {
    setViewTarget(documento || null)
  }
  const openEditModal = (documento) => {
    setViewTarget(documento || null)
    setEditTarget(documento || null)
    setEditValues({
      fechaPresentacion: documento?.fechaPresentacion || '',
      proximaFechaPresentacion: documento?.proximaFechaPresentacion || '',
      validezDias: documento?.validezDias?.toString?.() || '',
    })
    setEditFile(null)
    setEditError('')
  }
  const handleEditFieldChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }
  const handleEditFileChange = (event) => {
    const file = event.target.files?.[0]
    setEditFile(file || null)
    setEditError('')
  }
  const getDocumentFileId = (documento) => {
    const archivo = documento?.archivo
    return typeof archivo === 'object' && archivo !== null ? archivo.id : archivo
  }

  useEffect(() => {
    let objectUrl = ''
    const controller = new AbortController()

    const loadViewDocument = async () => {
      const archivoId = getDocumentFileId(viewTarget)
      if (!viewTarget || !archivoId) {
        setViewDocumentUrl('')
        setViewDocumentError('')
        setIsLoadingViewDocument(false)
        return
      }

      setIsLoadingViewDocument(true)
      setViewDocumentError('')
      setViewDocumentUrl('')

      try {
        const response = await request(`/assets/${archivoId}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('No se pudo cargar el PDF del documento.')
        }
        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setViewDocumentUrl(objectUrl)
      } catch (error) {
        if (controller.signal.aborted) return
        setViewDocumentError(error.message || 'No se pudo cargar el PDF.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingViewDocument(false)
        }
      }
    }

    loadViewDocument()

    return () => {
      controller.abort()
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [viewTarget])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
    setUploadError('')
  }

  const handleUploadSubmit = async (event) => {
    event.preventDefault()
    if (!uploadTarget) return
    if (!selectedFile) {
      setUploadError('Seleccioná un archivo PDF para continuar.')
      return
    }
    if (selectedFile.type !== 'application/pdf') {
      setUploadError('Solo se permiten archivos PDF.')
      return
    }

    setIsUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadDirectusFile(selectedFile)
      const archivoId = uploaded?.data?.id
      if (!archivoId) {
        throw new Error('No se recibió el identificador del archivo.')
      }
      await updateProviderDocumentFile({
        documentoId: uploadTarget.id,
        archivoId,
      })
      closeUploadModal()
      if (onDocumentsUpdated) {
        await onDocumentsUpdated()
      }
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (documento) => {
    const shouldDelete = window.confirm(
      '¿Querés archivar este documento requerido?',
    )
    if (!shouldDelete) return
    setIsDeleting(true)
    setUploadError('')
    try {
      await updateProviderDocumentStatus({
        documentoId: documento.id,
        status: 'archived',
        archivo: null,
      })
      if (onDocumentsUpdated) {
        await onDocumentsUpdated()
      }
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApproveDocument = async (documento) => {
    setIsApproving(true)
    setUploadError('')
    try {
      await updateProviderDocumentStatus({
        documentoId: documento.id,
        status: 'approved',
      })
      if (onDocumentsUpdated) await onDocumentsUpdated()
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editTarget) return
    if (editFile && editFile.type !== 'application/pdf') {
      setEditError('Solo se permiten archivos PDF.')
      return
    }
    setIsSavingEdit(true)
    setEditError('')
    try {
      let archivoId = getDocumentFileId(editTarget)
      if (editFile) {
        const uploaded = await uploadDirectusFile(editFile)
        archivoId = uploaded?.data?.id
        if (!archivoId) throw new Error('No se recibió el identificador del archivo.')
      }
      const payload = {
        status: 'presented',
        archivo: archivoId || null,
        fechaPresentacion: editValues.fechaPresentacion || null,
        proximaFechaPresentacion: editValues.proximaFechaPresentacion || null,
        validezDias:
          editValues.validezDias === ''
            ? null
            : Number(editValues.validezDias),
      }
      await updateProviderDocument({ documentoId: editTarget.id, payload })
      closeEditModal()
      if (onDocumentsUpdated) await onDocumentsUpdated()
    } catch (error) {
      setEditError(error.message || 'No se pudo editar el documento.')
    } finally {
      setIsSavingEdit(false)
    }
  }
  const normalizedPersonaSearch = normalizeSearchValue(personaSearch)
  const normalizedVehiculoSearch = normalizeSearchValue(vehiculoSearch)

  const filteredPersonas = useMemo(() => {
    if (!normalizedPersonaSearch) return providerPersonas
    return providerPersonas.filter((persona) => {
      const nameValue = getPersonName(persona)
      const documentoValue = getPersonaDocumento(persona)
      const name = nameValue ? nameValue.toString().toLowerCase() : ''
      const documento = documentoValue
        ? documentoValue.toString().toLowerCase()
        : ''
      return (
        name.includes(normalizedPersonaSearch) ||
        documento.includes(normalizedPersonaSearch)
      )
    })
  }, [
    providerPersonas,
    normalizedPersonaSearch,
    getPersonName,
    getPersonaDocumento,
  ])

  const filteredVehiculos = useMemo(() => {
    if (!normalizedVehiculoSearch) return providerVehiculos
    return providerVehiculos.filter((vehiculo) => {
      const name = normalizeSearchValue(getVehicleName(vehiculo))
      const dominio = normalizeSearchValue(getVehiculoField(vehiculo?.dominio))
      const marca = normalizeSearchValue(getVehiculoField(vehiculo?.marca))
      const modelo = normalizeSearchValue(getVehiculoField(vehiculo?.modelo))
      return (
        name.includes(normalizedVehiculoSearch) ||
        dominio.includes(normalizedVehiculoSearch) ||
        marca.includes(normalizedVehiculoSearch) ||
        modelo.includes(normalizedVehiculoSearch)
      )
    })
  }, [
    providerVehiculos,
    normalizedVehiculoSearch,
    getVehicleName,
    getVehiculoField,
  ])

  const togglePersonaDocuments = (personaId) => {
    setExpandedPersonas((prev) => {
      const next = new Set(prev)
      if (next.has(personaId)) {
        next.delete(personaId)
      } else {
        next.add(personaId)
      }
      return next
    })
  }

  const toggleVehiculoDocuments = (vehiculoId) => {
    setExpandedVehiculos((prev) => {
      const next = new Set(prev)
      if (next.has(vehiculoId)) {
        next.delete(vehiculoId)
      } else {
        next.add(vehiculoId)
      }
      return next
    })
  }

  return (
    <div className="manager-provider-card">
      {showSummary && (
        <div className="manager-provider-top">
          <div className="manager-provider-summary">
            <strong>{getDisplayName(provider)}</strong>
            <span className="muted">CUIT: {provider.CUIT || '-'}</span>
            <span className="muted">
              Estado: {provider.status || 'Sin estado'}
            </span>
          </div>
        </div>
      )}
      <div
        className={[
          'manager-provider-subcards',
          showSummary ? null : 'manager-provider-subcards--flat',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <DocumentsSubcard
          title="Documentos a Presentar"
          documents={providerDocuments}
          getDocumentoName={getDocumentoName}
          tableId={`provider-${provider?.id ?? 'unknown'}`}
          showActions
          onUploadDocument={openUploadModal}
          onDeleteDocument={handleDeleteDocument}
          onViewDocument={openViewModal}
          onEditDocument={openEditModal}
          onApproveDocument={handleApproveDocument}
        />
        <div className="manager-subcard manager-subcard-group">
          <div className="manager-subcard-header manager-subcard-header--split">
            <div className="manager-subcard-title">
              <h5>Personas</h5>
              <span className="muted">
                {providerPersonas.length === 1
                  ? '1 registrada'
                  : `${providerPersonas.length} registradas`}
              </span>
              <div className="manager-subcard-search">
                <input
                  type="search"
                  placeholder="Buscar personas o DNI"
                  value={personaSearch}
                  onChange={(event) => setPersonaSearch(event.target.value)}
                  aria-label="Buscar personas o DNI"
                />
              </div>
            </div>
            <div className="manager-subcard-actions">
              <Button
                as={Link}
                to="/clientes/proveedor/persona/nuevo"
                variant="primary"
                size="small"
                state={{ customer, site, requirement, provider }}
              >
                Crear Persona +
              </Button>
            </div>
          </div>
          {providerPersonas.length > 0 && filteredPersonas.length === 0 && (
            <p className="muted">No hay personas que coincidan con el filtro.</p>
          )}
          {providerPersonas.length > 0 && (
            <div className="manager-subcard-group-content">
              <div className="manager-subcard manager-subcard-item">
                <div className="manager-entity-table-wrapper">
                  <table className="manager-entity-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersonas.map((persona) => {
                        const personaDocs =
                          documentosByPersona?.[persona.id] || []
                        const isExpanded = expandedPersonas.has(persona.id)
                        return (
                          <Fragment key={`persona-${persona.id}`}>
                            <tr>
                              <td>
                                <span
                                  className={`manager-entity-name${isExpanded ? ' manager-entity-name--expanded' : ''}`}
                                >
                                  {getPersonName(persona)}
                                </span>
                              </td>
                              <td>{getPersonaDocumento(persona)}</td>
                              <td>{getEntityStatusLabel(persona?.status)}</td>
                              <td>
                                <Button
                                  variant="ghost"
                                  size="small"
                                  onClick={() =>
                                    togglePersonaDocuments(persona.id)
                                  }
                                  disabled={personaDocs.length === 0}
                                >
                                  {personaDocs.length === 0
                                    ? 'Sin documentos'
                                    : isExpanded
                                      ? 'Ocultar documentos'
                                      : 'Ver documentos'}
                                </Button>
                              </td>
                            </tr>
                            {isExpanded && personaDocs.length > 0 && (
                              <tr>
                                <td colSpan={4}>
                                  <DocumentsSubcard
                                    title={`Documentos de ${getPersonName(persona)}`}
                                    documents={personaDocs}
                                    getDocumentoName={getDocumentoName}
                                    tableId={`persona-${persona.id}`}
                                    collapsible={false}
                                    defaultCollapsed={false}
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
            </div>
          )}
        </div>
        <div className="manager-subcard manager-subcard-group">
          <div className="manager-subcard-header manager-subcard-header--split">
            <div className="manager-subcard-title">
              <h5>Vehículos</h5>
              <span className="muted">
                {providerVehiculos.length === 1
                  ? '1 registrado'
                  : `${providerVehiculos.length} registrados`}
              </span>
              <div className="manager-subcard-search">
                <input
                  type="search"
                  placeholder="Buscar vehículos o dominio"
                  value={vehiculoSearch}
                  onChange={(event) => setVehiculoSearch(event.target.value)}
                  aria-label="Buscar vehículos o dominio"
                />
              </div>
            </div>
            <div className="manager-subcard-actions">
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
          {providerVehiculos.length === 0 && (
            <p className="muted">No hay vehículos registrados.</p>
          )}
          {providerVehiculos.length > 0 && filteredVehiculos.length === 0 && (
            <p className="muted">
              No hay vehículos que coincidan con el filtro.
            </p>
          )}
          {providerVehiculos.length > 0 && filteredVehiculos.length > 0 && (
            <div className="manager-subcard-group-content">
              <div className="manager-subcard manager-subcard-item">
                <div className="manager-entity-table-wrapper">
                  <table className="manager-entity-table">
                    <thead>
                      <tr>
                        <th>Dominio</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Color</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehiculos.map((vehiculo) => {
                        const vehiculoDocs =
                          documentosByVehiculo?.[vehiculo.id] || []
                        const isExpanded = expandedVehiculos.has(vehiculo.id)
                        return (
                          <Fragment key={`vehiculo-${vehiculo.id}`}>
                            <tr>
                              <td>
                                <span
                                  className={`manager-entity-name${isExpanded ? ' manager-entity-name--expanded' : ''}`}
                                >
                                  {getVehiculoField(vehiculo.dominio)}
                                </span>
                              </td>
                              <td>{getVehiculoField(vehiculo?.marca)}</td>
                              <td>{getVehiculoField(vehiculo?.modelo)}</td>
                              <td>{getVehiculoField(vehiculo?.color)}</td>
                              <td>{getEntityStatusLabel(vehiculo?.status)}</td>
                              <td>
                                <Button
                                  variant="ghost"
                                  size="small"
                                  onClick={() =>
                                    toggleVehiculoDocuments(vehiculo.id)
                                  }
                                  disabled={vehiculoDocs.length === 0}
                                >
                                  {vehiculoDocs.length === 0
                                    ? 'Sin documentos'
                                    : isExpanded
                                      ? 'Ocultar documentos'
                                      : 'Ver documentos'}
                                </Button>
                              </td>
                            </tr>
                            {isExpanded && vehiculoDocs.length > 0 && (
                              <tr>
                                <td colSpan={6}>
                                  <DocumentsSubcard
                                    title={`Documentos de ${getVehicleName(
                                      vehiculo,
                                    )}`}
                                    documents={vehiculoDocs}
                                    getDocumentoName={getDocumentoName}
                                    tableId={`vehiculo-${vehiculo.id}`}
                                    collapsible={false}
                                    defaultCollapsed={false}
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
            </div>
          )}
        </div>
      </div>
      {uploadTarget && (
        <div className="manager-modal">
          <div className="manager-modal__backdrop" onClick={closeUploadModal} />
          <div className="manager-modal__content" role="dialog" aria-modal="true">
            <div className="manager-modal__header">
              <div>
                <h4>{modalTitle}</h4>
                <p className="muted">Cargar Documento para Proveedor</p>
              </div>
              <button
                type="button"
                className="manager-modal__close"
                onClick={closeUploadModal}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <form className="manager-modal__body" onSubmit={handleUploadSubmit}>
              <label className="manager-modal__label" htmlFor="upload-document">
                Seleccioná un archivo PDF
              </label>
              <input
                id="upload-document"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="muted">
                  Archivo seleccionado: {selectedFile.name}
                </p>
              )}
              <p className="muted">
                URL para Postman: <code>{uploadEndpoint}</code>
              </p>
              {uploadError && (
                <p className="manager-modal__error">{uploadError}</p>
              )}
              <div className="manager-modal__actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeUploadModal}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isUploading}>
                  {isUploading ? 'Subiendo...' : 'Aceptar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewTarget && (
        <div className="manager-modal">
          <div className="manager-modal__backdrop" onClick={closeViewModal} />
          <div
            className="manager-modal__content manager-modal__content--wide"
            role="dialog"
            aria-modal="true"
          >
            <div className="manager-modal__header">
              <div>
                <h4>{modalTitle}</h4>
                <p className="muted">Documento presentado</p>
              </div>
              <button
                type="button"
                className="manager-modal__close"
                onClick={closeViewModal}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="manager-modal__body manager-modal__body--split">
              <div className="manager-modal__info">
                <p><strong>Documento:</strong> {getDocumentoName(viewTarget)}</p>
                <p><strong>Estado:</strong> {getStatusLabel(viewTarget?.status)}</p>
                <p><strong>Fecha Presentación:</strong> {formatDate(viewTarget?.fechaPresentacion)}</p>
                <p><strong>Próxima Presentación:</strong> {formatDate(viewTarget?.proximaFechaPresentacion)}</p>
              </div>
              <div className="manager-modal__preview">
                {isLoadingViewDocument && (
                  <p className="muted">Cargando documento...</p>
                )}
                {!isLoadingViewDocument && viewDocumentError && (
                  <p className="manager-modal__error">{viewDocumentError}</p>
                )}
                {!isLoadingViewDocument && !viewDocumentError && viewDocumentUrl ? (
                  <iframe
                    title={`Vista previa de ${getDocumentoName(viewTarget)}`}
                    src={viewDocumentUrl}
                    className="manager-modal__pdf"
                  />
                ) : (
                  !isLoadingViewDocument &&
                  !viewDocumentError && (
                    <p className="muted">
                      Este documento no tiene archivo PDF asociado.
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {editTarget && (
        <div className="manager-modal">
          <div className="manager-modal__backdrop" onClick={closeEditModal} />
          <div className="manager-modal__content manager-modal__content--wide" role="dialog" aria-modal="true">
            <div className="manager-modal__header">
              <div>
                <h4>{modalTitle}</h4>
                <p className="muted">Editar documento presentado</p>
              </div>
              <button type="button" className="manager-modal__close" onClick={closeEditModal} aria-label="Cerrar">✕</button>
            </div>
            <form className="manager-modal__body manager-modal__body--split" onSubmit={handleEditSubmit}>
              <div className="manager-modal__info manager-modal__form-grid">
                <p><strong>Documento:</strong> {getDocumentoName(editTarget)}</p>
                <label className="manager-modal__label" htmlFor={`edit-fecha-${editTarget.id}`}>Fecha presentación</label>
                <input id={`edit-fecha-${editTarget.id}`} type="date" value={editValues.fechaPresentacion} onChange={(event) => handleEditFieldChange('fechaPresentacion', event.target.value)} />
                <label className="manager-modal__label" htmlFor={`edit-proxima-${editTarget.id}`}>Próxima presentación</label>
                <input id={`edit-proxima-${editTarget.id}`} type="date" value={editValues.proximaFechaPresentacion} onChange={(event) => handleEditFieldChange('proximaFechaPresentacion', event.target.value)} />
                <label className="manager-modal__label" htmlFor={`edit-validez-${editTarget.id}`}>Validez (días)</label>
                <input id={`edit-validez-${editTarget.id}`} type="number" min="0" value={editValues.validezDias} onChange={(event) => handleEditFieldChange('validezDias', event.target.value)} />
                <label className="manager-modal__label" htmlFor={`edit-file-${editTarget.id}`}>Reemplazar PDF</label>
                <input id={`edit-file-${editTarget.id}`} type="file" accept="application/pdf" onChange={handleEditFileChange} />
                {editFile && <p className="muted">Nuevo archivo: {editFile.name}</p>}
                {editError && <p className="manager-modal__error">{editError}</p>}
                <div className="manager-modal__actions">
                  <Button type="button" variant="secondary" onClick={closeEditModal} disabled={isSavingEdit}>Cancelar</Button>
                  <Button type="submit" variant="primary" disabled={isSavingEdit}>{isSavingEdit ? 'Guardando...' : 'Guardar cambios'}</Button>
                </div>
              </div>
              <div className="manager-modal__preview">
                {isLoadingViewDocument && editTarget?.id === viewTarget?.id && <p className="muted">Cargando documento...</p>}
                {!viewDocumentError && viewDocumentUrl && editTarget?.id === viewTarget?.id ? (
                  <iframe title={`Vista previa de ${getDocumentoName(editTarget)}`} src={viewDocumentUrl} className="manager-modal__pdf" />
                ) : (
                  <p className="muted">Usá Visualizar para previsualizar el PDF actual.</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
            {isDeleting && (
        <p className="muted manager-documents-feedback">
          Archivando documento...
        </p>
      )}
      {isApproving && (
        <p className="muted manager-documents-feedback">
          Aprobando documento...
        </p>
      )}
    </div>
  )
}

export default ProviderCard
