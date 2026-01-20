import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
        <PageHeader
          title="Manager"
          subtitle="Elegí un cliente para revisar el árbol completo de información."
        />
        <SearchBar
          value={customerSearch}
          placeholder="Buscar clientes..."
          onChange={(value) => setCustomerSearch(value)}
          className="manager-search"
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
  const sites = detail?.sites ?? []

  return (
    <section className="manager-view">
      <PageHeader
        title={`Cliente: ${customer?.name || 'Sin nombre'}`}
        subtitle={`CUIT: ${customer?.CUIT || '-'} · Estado: ${
          customer?.status || 'Sin estado'
        }`}
        actionsClassName="manager-header-actions"
        actions={
          <>
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
          </>
        }
      />
      {detailError && (
        <ErrorBanner>No se pudo cargar el detalle. {detailError}</ErrorBanner>
      )}
      {detailLoading && <p className="muted">Cargando detalle del cliente...</p>}
      {!detailLoading && sites.length === 0 && (
        <PanelCard>
          <p className="muted">Este cliente no tiene sites registrados.</p>
        </PanelCard>
      )}
      <ManagerTree
        customer={customer}
        sites={sites}
        requirementsBySite={requirementsBySite}
        providersByRequirement={providersByRequirement}
        documentosByProvider={documentosByProvider}
        personasByProvider={personasByProvider}
        vehiculosByProvider={vehiculosByProvider}
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