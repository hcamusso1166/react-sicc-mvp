import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button'
import { ErrorBanner } from '../../components/Banner'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'
import SearchBar from '../../components/SearchBar'
import ManagerTree from './components/ManagerTree'

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
    return (
    documento.nombreDocumento ||
    documento?.tipoDocumento?.nombreDocumento ||
    documento.nombre ||
    documento.descripcion ||
    `Documento ${documento.id}`
  )
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
  const [siteSearch, setSiteSearch] = useState('')

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

  const reloadDetail = useCallback(async () => {
    if (!customerId) {
      setDetail(null)
      setDetailError('')
      setDetailLoading(false)
      return
    }
    setDetailLoading(true)
    setDetailError('')
    try {
      const nextDetail = await fetchManagerCustomerDetail(customerId)
      setDetail(nextDetail)
    } catch (error) {
      setDetailError(error.message)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    reloadDetail()
  }, [reloadDetail])

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

    const documentosByPersona = useMemo(() => {
    if (!detail?.documentos) return {}
    return groupBy(detail.documentos, (doc) => getRelationId(doc.idPersona))
  }, [detail])

  const documentosByVehiculo = useMemo(() => {
    if (!detail?.documentos) return {}
    return groupBy(detail.documentos, (doc) => getRelationId(doc.idVehiculo))
  }, [detail])

  const sites = detail?.sites ?? []
  const filteredSites = useMemo(() => {
    const normalizedSearch = normalizeValue(siteSearch)
    if (!normalizedSearch) return sites
    return sites.filter((site) =>
      normalizeValue(getDisplayName(site, '')).includes(normalizedSearch),
    )
  }, [sites, siteSearch])

  if (!customerId) {
    return (
      <section className="manager-view">
        <PageHeader
          title={
            <div className="manager-title-row">
              <h2>Manager</h2>
              <span className="manager-title-subtitle muted">
                Elegí un cliente para revisar el árbol completo de información.
              </span>
            </div>
          }
          actionsClassName="manager-header-actions"
          actions={
            <SearchBar
              value={customerSearch}
              placeholder="Buscar clientes..."
              onChange={(value) => setCustomerSearch(value)}
              className="manager-search"
            />
          }
        />
        {customersError && (
          <ErrorBanner>
            No se pudo cargar el listado. {customersError}
          </ErrorBanner>
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

  return (
    <section className="manager-view">
      <PageHeader
        title={
          <h2 className="manager-customer-heading">
            <strong className="manager-customer-name">
              {customer?.name || 'Sin nombre'}
            </strong>
            <span className="manager-inline-meta">
              <span>CUIT: {customer?.CUIT || '-'}</span>
              <span>Estado: {customer?.status || 'Sin estado'}</span>
            </span>
          </h2>        
        }
        actionsClassName="manager-header-actions"
        actions={
          <>
            <Button
              as={Link}
              to="/manager"
              variant="secondary"
              onClick={() => {
                setCustomerSearch('')
                setSiteSearch('')
              }}
            >
              Volver
            </Button>
            <Button
              as={Link}
              to="/clientes/site/nuevo"
              variant="primary"
              state={{ customer }}
            >
              Crear Site +
            </Button>
          </>
        }
      />
      <div className="manager-sites-header">
        <div className="manager-sites-title">
          <h3>Sites</h3>
          <SearchBar
            value={siteSearch}
            placeholder="Buscar sites..."
            onChange={(value) => setSiteSearch(value)}
            className="manager-sites-search"
            aria-label="Buscar sites"
          />
        </div>
      </div>
      {detailError && (
        <ErrorBanner>No se pudo cargar el detalle. {detailError}</ErrorBanner>
      )}
      {detailLoading && <p className="muted">Cargando detalle del cliente...</p>}
      {!detailLoading && sites.length === 0 && (
        <PanelCard>
          <p className="muted">Este cliente no tiene sites registrados.</p>
        </PanelCard>
      )}
      {!detailLoading && sites.length > 0 && filteredSites.length === 0 && (
        <PanelCard>
          <p className="muted">No hay sites que coincidan con el filtro.</p>
        </PanelCard>
      )}
      <ManagerTree
        customer={customer}
        sites={filteredSites}
        requirementsBySite={requirementsBySite}
        providersByRequirement={providersByRequirement}
        documentosByProvider={documentosByProvider}
        documentosByPersona={documentosByPersona}
        documentosByVehiculo={documentosByVehiculo}       
        personasByProvider={personasByProvider}
        vehiculosByProvider={vehiculosByProvider}
        onDocumentsCreated={reloadDetail}
        onDocumentsUpdated={reloadDetail}
        getDisplayName={getDisplayName}
        getDocumentoName={getDocumentoName}
        getPersonName={getPersonName}
        getPersonaDocumento={getPersonaDocumento}
        getVehicleName={getVehicleName}
        getVehiculoField={getVehiculoField}
      />
    </section>
  )
}

export default ManagerPage