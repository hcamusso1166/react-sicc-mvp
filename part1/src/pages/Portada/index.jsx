import { useCallback, useEffect, useMemo, useState } from 'react'
import { ErrorBanner } from '../../components/Banner'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'
import SearchBar from '../../components/SearchBar'
import FormField from '../../components/Form/FormField'
import FormGrid from '../../components/Form/FormGrid'
import SelectInput from '../../components/Form/SelectInput'
import StatusPill from '../../components/StatusPill'
import {
  fetchManagerCustomerDetail,
  fetchManagerCustomers,
} from '../../services/directus'

const normalizeValue = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const getRelationId = (value) => {
  if (Array.isArray(value)) {
    return value[0]?.id ?? value[0]
  }
  if (value && typeof value === 'object') {
    return value.id
  }
  return value
}

const getRelationIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => item?.id ?? item).filter(Boolean)
  }
  if (value && typeof value === 'object') {
    return value.id ? [value.id] : []
  }
  return value ? [value] : []
}

const groupBy = (items, getKey) =>
  items.reduce((acc, item) => {
    const key = getKey(item)
    if (!key) return acc
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

const getDisplayName = (item, fallback = 'Sin nombre') => {
  if (!item) return fallback
  if (item.nombre) return item.nombre
  if (item.name) return item.name
  if (item.razonSocial) return item.razonSocial
  return fallback
}

const getPersonName = (person) => {
  if (!person) return 'Persona'
  const fullName = [person.nombre, person.apellido].filter(Boolean).join(' ')
  return fullName || person.name || `Persona ${person.id ?? ''}`.trim()
}

const getVehicleName = (vehiculo) => {
  if (!vehiculo) return 'Vehículo'
  return (
    vehiculo.dominio ||
    vehiculo.modelo ||
    `Vehículo ${vehiculo.id ?? ''}`.trim()
  )
}

const getPersonaDocumento = (persona) => {
  if (!persona) return '-'
  return persona.DNI || persona.dni || persona.documento || '-'
}

const getVehiculoField = (value, fallback = '-') =>
  value?.toString().trim() || fallback

const AUTHORIZED_STATUSES = new Set(['approved', 'finalized', 'archived'])
const BLOCKED_STATUSES = new Set(['rejected'])

const getAuthorizationSummary = (documents = []) => {
  if (!documents.length) {
    return {
      label: 'Sin documentos',
      className: 'portada-pill--neutral',
      summary: 'No hay documentación asociada.',
    }
  }

  const statuses = documents.map((doc) => doc.status).filter(Boolean)
  const blocked = statuses.some((status) => BLOCKED_STATUSES.has(status))
  const authorized = statuses.every((status) => AUTHORIZED_STATUSES.has(status))
  const pendingCount = statuses.filter(
    (status) => !AUTHORIZED_STATUSES.has(status),
  ).length

  if (blocked) {
    return {
      label: 'No autorizado',
      className: 'portada-pill--blocked',
      summary: `${pendingCount || 1} documento(s) rechazado(s).`,
    }
  }

  if (authorized) {
    return {
      label: 'Autorizado',
      className: 'portada-pill--authorized',
      summary: `${documents.length} documento(s) aprobados.`,
    }
  }

  return {
    label: 'Pendiente',
    className: 'portada-pill--pending',
    summary: `${pendingCount} documento(s) pendiente(s).`,
  }
}

const PortadaPage = () => {
  const [customers, setCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [personSearch, setPersonSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersError, setCustomersError] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detail, setDetail] = useState(null)

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = normalizeValue(customerSearch)
    if (!normalizedSearch) return customers
    return customers.filter((customer) =>
      normalizeValue(customer.name || '').includes(normalizedSearch),
    )
  }, [customerSearch, customers])

  useEffect(() => {
    let isMounted = true
    const loadCustomers = async () => {
      setLoadingCustomers(true)
      setCustomersError('')
      try {
        const nextCustomers = await fetchManagerCustomers()
        if (isMounted) {
          setCustomers(nextCustomers)
        }
      } catch (error) {
        if (isMounted) {
          setCustomersError(error.message)
        }
      } finally {
        if (isMounted) {
          setLoadingCustomers(false)
        }
      }
    }

    loadCustomers()

    return () => {
      isMounted = false
    }
  }, [])

  const reloadDetail = useCallback(async () => {
    if (!selectedCustomerId) {
      setDetail(null)
      setDetailError('')
      setDetailLoading(false)
      return
    }
    setDetailLoading(true)
    setDetailError('')
    try {
      const nextDetail = await fetchManagerCustomerDetail(selectedCustomerId)
      setDetail(nextDetail)
    } catch (error) {
      setDetailError(error.message)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [selectedCustomerId])

  useEffect(() => {
    reloadDetail()
  }, [reloadDetail])

  const requirementsBySite = useMemo(() => {
    if (!detail?.requirements) return {}
    return groupBy(detail.requirements, (req) => getRelationId(req.idSites))
  }, [detail])

  const documentosByPersona = useMemo(() => {
    if (!detail?.documentos) return {}
    return groupBy(detail.documentos, (doc) => getRelationId(doc.idPersona))
  }, [detail])

  const documentosByVehiculo = useMemo(() => {
    if (!detail?.documentos) return {}
    return groupBy(detail.documentos, (doc) => getRelationId(doc.idVehiculo))
  }, [detail])

  const providersById = useMemo(() => {
    return (detail?.providers || []).reduce((acc, provider) => {
      if (provider?.id) acc.set(provider.id, provider)
      return acc
    }, new Map())
  }, [detail])

  const sites = detail?.sites ?? []
  const requirementsForSite = useMemo(() => {
    if (!selectedSiteId) return []
    return requirementsBySite?.[selectedSiteId] || []
  }, [requirementsBySite, selectedSiteId])

  const providerIdsForSite = useMemo(() => {
    const requirementIds = requirementsForSite.map((req) => req.id).filter(Boolean)
    if (!requirementIds.length) return []
    return (detail?.providers || [])
      .filter((provider) =>
        getRelationIds(provider.idRequerimientos).some((reqId) =>
          requirementIds.includes(reqId),
        ),
      )
      .map((provider) => provider.id)
      .filter(Boolean)
  }, [detail, requirementsForSite])

  const personasForSite = useMemo(() => {
    if (!providerIdsForSite.length) return []
    return (detail?.personas || []).filter((persona) =>
      providerIdsForSite.includes(getRelationId(persona.idProveedor)),
    )
  }, [detail, providerIdsForSite])

  const vehiculosForSite = useMemo(() => {
    if (!providerIdsForSite.length) return []
    return (detail?.vehiculos || []).filter((vehiculo) =>
      providerIdsForSite.includes(getRelationId(vehiculo.idProveedor)),
    )
  }, [detail, providerIdsForSite])

  const normalizedPersonSearch = normalizeValue(personSearch)
  const normalizedVehicleSearch = normalizeValue(vehicleSearch)

  const filteredPersonas = useMemo(() => {
    if (!normalizedPersonSearch) return personasForSite
    return personasForSite.filter((persona) => {
      const name = normalizeValue(getPersonName(persona))
      const documento = normalizeValue(getPersonaDocumento(persona))
      return (
        name.includes(normalizedPersonSearch) ||
        documento.includes(normalizedPersonSearch)
      )
    })
  }, [normalizedPersonSearch, personasForSite])

  const filteredVehiculos = useMemo(() => {
    if (!normalizedVehicleSearch) return vehiculosForSite
    return vehiculosForSite.filter((vehiculo) => {
      const name = normalizeValue(getVehicleName(vehiculo))
      const dominio = normalizeValue(getVehiculoField(vehiculo.dominio))
      const marca = normalizeValue(getVehiculoField(vehiculo.marca))
      const modelo = normalizeValue(getVehiculoField(vehiculo.modelo))
      return [name, dominio, marca, modelo].some((value) =>
        value.includes(normalizedVehicleSearch),
      )
    })
  }, [normalizedVehicleSearch, vehiculosForSite])

  const handleCustomerChange = (event) => {
    const nextCustomerId = event.target.value
    setSelectedCustomerId(nextCustomerId)
    setSelectedSiteId('')
    setPersonSearch('')
    setVehicleSearch('')
  }

  const handleSiteChange = (event) => {
    setSelectedSiteId(event.target.value)
    setPersonSearch('')
    setVehicleSearch('')
  }

  const selectionReady = Boolean(selectedCustomerId && selectedSiteId)

  return (
    <section className="portada-view">
      <PageHeader
        title="Portada"
        subtitle="Consulta rápida de personas y vehículos autorizados por cliente y establecimiento."
      />

      {customersError ? <ErrorBanner message={customersError} /> : null}
      {detailError ? <ErrorBanner message={detailError} /> : null}

      <PanelCard className="portada-filters">
        <div className="panel-header">
          <h3>Filtros iniciales</h3>
          {detailLoading ? (
            <span className="muted">Cargando datos...</span>
          ) : null}
        </div>
        <FormGrid className="portada-filter-grid">
          <FormField label="Buscar cliente">
            <SearchBar
              value={customerSearch}
              onChange={setCustomerSearch}
              placeholder="Buscar cliente..."
              showIcon
            />
          </FormField>
          <FormField label="Cliente">
            <SelectInput
              value={selectedCustomerId}
              onChange={handleCustomerChange}
              disabled={loadingCustomers}
            >
              <option value="">
                {loadingCustomers
                  ? 'Cargando clientes...'
                  : 'Selecciona un cliente'}
              </option>
              {filteredCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Establecimiento">
            <SelectInput
              value={selectedSiteId}
              onChange={handleSiteChange}
              disabled={!selectedCustomerId || detailLoading}
            >
              <option value="">
                {selectedCustomerId
                  ? detailLoading
                    ? 'Cargando sites...'
                    : 'Selecciona un establecimiento'
                  : 'Selecciona un cliente primero'}
              </option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.nombre}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </FormGrid>
        {selectedCustomerId && detail?.customer ? (
          <div className="portada-summary">
            <div>
              <p className="muted">Cliente seleccionado</p>
              <strong>{detail.customer.name}</strong>
            </div>
            <div>
              <p className="muted">CUIT</p>
              <strong>{detail.customer.CUIT || '-'}</strong>
            </div>
            <div>
              <p className="muted">Sites disponibles</p>
              <strong>{sites.length}</strong>
            </div>
          </div>
        ) : null}
      </PanelCard>

      <div className="portada-results">
        <PanelCard className="portada-panel">
          <div className="panel-header">
            <div>
              <h3>Personas</h3>
              <p className="muted">Buscar por nombre o DNI.</p>
            </div>
          </div>
          <SearchBar
            value={personSearch}
            onChange={setPersonSearch}
            placeholder="Buscar persona..."
            showIcon
            disabled={!selectionReady}
          />
          {!selectionReady ? (
            <p className="muted portada-empty">
              Selecciona cliente y establecimiento para buscar personas.
            </p>
          ) : filteredPersonas.length ? (
            <div className="portada-entity-list">
              {filteredPersonas.map((persona) => {
                const providerId = getRelationId(persona.idProveedor)
                const provider = providersById.get(providerId)
                const docs = documentosByPersona?.[persona.id] || []
                const auth = getAuthorizationSummary(docs)
                return (
                  <div key={persona.id} className="portada-entity-card">
                    <div className="portada-entity-header">
                      <div>
                        <strong>{getPersonName(persona)}</strong>
                        <p className="muted">DNI: {getPersonaDocumento(persona)}</p>
                      </div>
                      <StatusPill className={auth.className}>
                        {auth.label}
                      </StatusPill>
                    </div>
                    <div className="portada-entity-details">
                      <p>
                        <span className="muted">Proveedor:</span>{' '}
                        {getDisplayName(provider, 'Sin proveedor')}
                      </p>
                      <p className="muted">{auth.summary}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="muted portada-empty">
              No hay personas que coincidan con el filtro.
            </p>
          )}
        </PanelCard>

        <PanelCard className="portada-panel">
          <div className="panel-header">
            <div>
              <h3>Vehículos</h3>
              <p className="muted">Buscar por dominio, marca o modelo.</p>
            </div>
          </div>
          <SearchBar
            value={vehicleSearch}
            onChange={setVehicleSearch}
            placeholder="Buscar vehículo..."
            showIcon
            disabled={!selectionReady}
          />
          {!selectionReady ? (
            <p className="muted portada-empty">
              Selecciona cliente y establecimiento para buscar vehículos.
            </p>
          ) : filteredVehiculos.length ? (
            <div className="portada-entity-list">
              {filteredVehiculos.map((vehiculo) => {
                const providerId = getRelationId(vehiculo.idProveedor)
                const provider = providersById.get(providerId)
                const docs = documentosByVehiculo?.[vehiculo.id] || []
                const auth = getAuthorizationSummary(docs)
                return (
                  <div key={vehiculo.id} className="portada-entity-card">
                    <div className="portada-entity-header">
                      <div>
                        <strong>{getVehicleName(vehiculo)}</strong>
                        <p className="muted">
                          Dominio: {getVehiculoField(vehiculo.dominio)}
                        </p>
                      </div>
                      <StatusPill className={auth.className}>
                        {auth.label}
                      </StatusPill>
                    </div>
                    <div className="portada-entity-details">
                      <p>
                        <span className="muted">Marca:</span>{' '}
                        {getVehiculoField(vehiculo.marca)}
                      </p>
                      <p>
                        <span className="muted">Modelo:</span>{' '}
                        {getVehiculoField(vehiculo.modelo)}
                      </p>
                      <p>
                        <span className="muted">Proveedor:</span>{' '}
                        {getDisplayName(provider, 'Sin proveedor')}
                      </p>
                      <p className="muted">{auth.summary}</p>
                    </div>
                  </div>
                )}
              )}
            </div>
          ) : (
            <p className="muted portada-empty">
              No hay vehículos que coincidan con el filtro.
            </p>
          )}
        </PanelCard>
      </div>
    </section>
  )
}

export default PortadaPage