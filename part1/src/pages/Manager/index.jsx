import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

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

const getDocumentoName = (documento) => {
  if (!documento) return 'Documento'
  return documento.nombre || documento.descripcion || `Documento ${documento.id}`
}

const ManagerPage = () => {
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')
  const [customers, setCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
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
      setCustomers([])
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

  useEffect(() => {
    let isMounted = true
    if (!customerId) {
      setDetail(null)
      setDetailError('')
      setDetailLoading(false)
      return undefined
    }

    const loadDetail = async () => {
      setDetailLoading(true)
      setDetailError('')
      try {
        const nextDetail = await fetchManagerCustomerDetail(customerId)
        if (isMounted) {
          setDetail(nextDetail)
        }
      } catch (error) {
        if (isMounted) {
          setDetailError(error.message)
          setDetail(null)
        }
      } finally {
        if (isMounted) {
          setDetailLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      isMounted = false
    }
  }, [customerId])

  const requirementsBySite = useMemo(() => {
    if (!detail?.requirements) return {}
    return groupBy(detail.requirements, (req) => getRelationId(req.idSites))
  }, [detail])

  const providersByRequirement = useMemo(() => {
    if (!detail?.providers) return {}
    return groupBy(detail.providers, (provider) =>
      getRelationId(provider.idRequerimientos),
    )
  }, [detail])

  const personasByProvider = useMemo(() => {
    if (!detail?.personas) return {}
    return groupBy(detail.personas, (persona) =>
      getRelationId(persona.idProveedor),
    )
  }, [detail])

  const vehiculosByProvider = useMemo(() => {
    if (!detail?.vehiculos) return {}
    return groupBy(detail.vehiculos, (vehiculo) =>
      getRelationId(vehiculo.idProveedor),
    )
  }, [detail])

  const documentosByProvider = useMemo(() => {
    if (!detail?.documentos) return {}
    return groupBy(detail.documentos, (doc) => getRelationId(doc.idProveedor))
  }, [detail])

  if (!customerId) {
    return (
      <section className="manager-view">
        <header className="dashboard-header">
          <div>
            <h2>Manager</h2>
            <p className="muted">
              Elegí un cliente para revisar el árbol completo de información.
            </p>
          </div>
        </header>
        <div className="manager-search">
          <span className="manager-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Buscar clientes..."
            className="text-input"
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
          />
        </div>
        {customersError && (
          <div className="error-banner">
            No se pudo cargar el listado. {customersError}
          </div>
        )}
        <div className="manager-list">
          {loadingCustomers && (
            <div className="manager-list-item muted">Cargando clientes...</div>
          )}
          {!loadingCustomers && filteredCustomers.length === 0 && (
            <div className="manager-list-item muted">
              No hay clientes para mostrar.
            </div>
          )}
          {filteredCustomers.map((customer) => (
            <Link
              key={customer.id}
              to={`/manager?customerId=${customer.id}`}
              className="manager-list-item"
            >
              {customer.name || 'Sin nombre'}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  const customer = detail?.customer
  const sites = detail?.sites ?? []

  return (
    <section className="manager-view">
      <header className="dashboard-header">
        <div>
          <h2>Cliente: {customer?.name || 'Sin nombre'}</h2>
          <p className="muted">
            CUIT: {customer?.CUIT || '-'} · Estado:{' '}
            {customer?.status || 'Sin estado'}
          </p>
        </div>
        <div className="manager-header-actions">
          <Link to="/manager" className="secondary-button">
            Volver
          </Link>
          <Link
            to="/clientes/site/nuevo"
            className="primary-button"
            state={{ customer }}
          >
            Crear Site +
          </Link>
        </div>
      </header>
        {detailError && (
        <div className="error-banner">
          No se pudo cargar el detalle. {detailError}
        </div>
      )}
      {detailLoading && <p className="muted">Cargando detalle del cliente...</p>}
      {!detailLoading && sites.length === 0 && (
        <div className="panel-card">
          <p className="muted">Este cliente no tiene sites registrados.</p>
        </div>
      )}
      <div className="manager-tree">
        {sites.map((site) => {
          const siteRequirements = requirementsBySite[site.id] || []
          return (
            <div key={site.id} className="manager-tree-card">
              <div className="manager-tree-header">
                <div>
                  <h3>Site: {getDisplayName(site)}</h3>
                  <p className="muted">Estado: {site.status || 'Sin estado'}</p>
                </div>
                <Link
                  to="/clientes/requerimiento/nuevo"
                  className="primary-button small"
                  state={{ customer, site }}
                >
                  Crear Requerimiento +
                </Link>
              </div>
              <div className="manager-tree-body">
                {siteRequirements.length === 0 && (
                  <p className="muted">
                    No hay requerimientos registrados para este site.
                  </p>
                )}
                {siteRequirements.map((requirement) => {
                  const requirementProviders =
                    providersByRequirement[requirement.id] || []
                  return (
                    <div key={requirement.id} className="manager-requirement-card">
                      <div className="manager-tree-header">
                        <div>
                          <h4>
                            Requerimiento: {getDisplayName(requirement)}
                          </h4>
                          <p className="muted">
                            Estado: {requirement.status || 'Sin estado'}
                          </p>
                        </div>
                        <Link
                          to="/clientes/proveedor/nuevo"
                          className="primary-button small"
                          state={{ customer, site, requirement }}
                        >
                          Crear Proveedor +
                        </Link>
                      </div>
                      <div className="manager-provider-section">
                        <div className="manager-provider-header">
                          <span>Proveedores</span>
                          <button
                            type="button"
                            className="ghost-button small"
                          >
                            Crear Documentos Requerido
                          </button>
                        </div>
                        {requirementProviders.length === 0 && (
                          <p className="muted">
                            No hay proveedores asociados a este requerimiento.
                          </p>
                        )}
                        {requirementProviders.map((provider) => {
                          const providerDocuments =
                            documentosByProvider[provider.id] || []
                          const providerPersonas =
                            personasByProvider[provider.id] || []
                          const providerVehiculos =
                            vehiculosByProvider[provider.id] || []
                          return (
                            <div
                              key={provider.id}
                              className="manager-provider-card"
                            >
<div className="manager-provider-top">
                                <div className="manager-provider-summary">
                                  <strong>{getDisplayName(provider)}</strong>
                                  <span className="muted">
                                    CUIT: {provider.CUIT || '-'}
                                  </span>
                                  <span className="muted">
                                    Estado: {provider.status || 'Sin estado'}
                                  </span>
                                </div>
                                <div className="manager-provider-actions">
                                  <Link
                                    to="/clientes/proveedor/persona/nuevo"
                                    className="primary-button small"
                                    state={{ customer, site, requirement, provider }}
                                  >
                                    Crear Persona +
                                  </Link>
                                  <Link
                                    to="/clientes/proveedor/vehiculo/nuevo"
                                    className="primary-button small"
                                    state={{ customer, site, requirement, provider }}
                                  >
                                    Crear Vehículo +
                                  </Link>
                                </div>
                              </div>
                              <div className="manager-provider-documents">
                                <h5>Documentos requeridos</h5>
                                {providerDocuments.length === 0 && (
                                  <p className="muted">
                                    No hay documentos cargados.
                                  </p>
                                )}
                                {providerDocuments.length > 0 && (
                                  <ul>
                                    {providerDocuments.map((documento) => (
                                      <li key={documento.id}>
                                        {getDocumentoName(documento)}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="manager-provider-subcards">
                                <div className="manager-subcard">
                                  <div className="manager-subcard-header">
                                    <h5>Personas</h5>
                                  </div>
                                  {providerPersonas.length === 0 && (
                                    <p className="muted">
                                      No hay personas registradas.
                                    </p>
                                  )}
                                  {providerPersonas.length > 0 && (
                                    <ul>
                                        {providerPersonas.map((persona) => (
                                        <li key={persona.id}>
                                          <strong>{getPersonName(persona)}</strong>
                                          <span className="muted">
                                            DNI: {getPersonaDocumento(persona)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div className="manager-subcard">
                                  <div className="manager-subcard-header">
                                    <h5>Vehículos</h5>
                                  </div>
                                  {providerVehiculos.length === 0 && (
                                    <p className="muted">
                                      No hay vehículos registrados.
                                    </p>
                                  )}
                                   {providerVehiculos.length > 0 && (
                                    <ul>
                                      {providerVehiculos.map((vehiculo) => (
                                        <li key={vehiculo.id}>
                                          <strong>
                                            {getVehicleName(vehiculo)}
                                          </strong>
                                          <span className="muted">
                                            Dominio:{' '}
                                            {getVehiculoField(vehiculo.dominio)}
                                          </span>
                                          <span className="muted">
                                            Marca: {getVehiculoField(vehiculo.marca)}
                                          </span>
                                          <span className="muted">
                                            Modelo:{' '}
                                            {getVehiculoField(vehiculo.modelo)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ManagerPage