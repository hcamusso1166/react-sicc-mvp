const API_BASE =
  import.meta.env.VITE_DIRECTUS_URL ||
  (import.meta.env.DEV ? '/directus' : 'https://tto.com.ar')

const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || ''

const DASHBOARD_TABLES = {
  clientes: 'Clientes',
  sites: 'sites',
  requerimientos: 'requerimiento',
  proveedores: 'proveedor',
}

const TABLES = {
  ...DASHBOARD_TABLES,
  documentos: 'DocumentosRequeridos',
  personas: 'persona',
  vehiculos: 'vehiculo',
}

const fetchJSON = async (url) => {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: DIRECTUS_TOKEN
      ? {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        }
      : undefined,
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

const withCacheBust = (url, cacheBust) => {
  if (!cacheBust) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}cacheBust=${encodeURIComponent(cacheBust)}`
}

const safeFetchJSON = async (url) => {
  try {
    return await fetchJSON(url)
  } catch (error) {
    return { data: [], error }
  }
}
const postJSON = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(DIRECTUS_TOKEN
        ? {
            Authorization: `Bearer ${DIRECTUS_TOKEN}`,
          }
        : {}),
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

const fetchTableCount = (table) => {
  return fetchJSON(
    `${API_BASE}/items/${table}?limit=1&meta=filter_count&fields=id`,
  )
}

const getCountFromMeta = (payload) => {
  return Number(payload?.meta?.filter_count ?? 0)
}

const getStatusLabelFallback = (value) => {
  if (!value) return 'Sin estado'
  return value.toString().replace(/_/g, ' ')
}

const fetchDashboardData = async ({ colors, getStatusLabel }) => {
  const labelFormatter = getStatusLabel || getStatusLabelFallback
  const [
    clientesResponse,
    sitesResponse,
    requerimientosResponse,
    proveedoresResponse,
    documentosStatusResponse,
    documentosListResponse,
  ] = await Promise.all([
    fetchTableCount(DASHBOARD_TABLES.clientes),
    fetchTableCount(DASHBOARD_TABLES.sites),
    fetchTableCount(DASHBOARD_TABLES.requerimientos),
    fetchTableCount(DASHBOARD_TABLES.proveedores),
    fetchJSON(
      `${API_BASE}/items/${TABLES.documentos}?groupBy[]=status&aggregate[count]=*`,
    ),
    fetchJSON(
      `${API_BASE}/items/${TABLES.documentos}?limit=5&sort[]=proximaFechaPresentacion&fields=id,status,idParametro,idProveedor,proximaFechaPresentacion,fechaPresentacion`,
    ),
  ])

  const counts = {
    clientes: getCountFromMeta(clientesResponse),
    sites: getCountFromMeta(sitesResponse),
    requerimientos: getCountFromMeta(requerimientosResponse),
    proveedores: getCountFromMeta(proveedoresResponse),
  }

  const grouped = documentosStatusResponse?.data ?? []
  const statusCounts = grouped.reduce((acc, row) => {
    const key = row?.status || 'Sin estado'
    const countValue =
      Number(row?.count?.['*']) ||
      Number(row?.count) ||
      Number(row?.total) ||
      0
    acc[key] = (acc[key] || 0) + countValue
    return acc
  }, {})
  const statusRows = Object.entries(statusCounts).map(
    ([estado, count], index) => ({
      label: labelFormatter(estado),
      value: Number(count ?? 0),
      color: colors[index % colors.length],
    }),
  )
  const statusData = statusRows.length
    ? statusRows
    : [
        {
          label: 'Pendiente',
          value: 0,
          color: colors[0],
        },
      ]

  return {
    counts,
    statusData,
    documentos: documentosListResponse?.data ?? [],
  }
}

const fetchCustomersPage = async ({ page, searchTerm = '', pageSize }) => {
  const trimmedSearch = searchTerm.trim()
  const query = new URLSearchParams({
    limit: String(pageSize),
    page: String(page),
    meta: 'filter_count',
    'sort[]': 'name',
  })
  if (trimmedSearch) {
    query.append('filter[name][_icontains]', trimmedSearch)
  }
  const response = await fetchJSON(
    `${API_BASE}/items/${TABLES.clientes}?${query.toString()}`,
  )

  return {
    customers: response?.data ?? [],
    total: getCountFromMeta(response),
  }
}

const fetchManagerCustomers = async () => {
  const cacheBust = Date.now().toString()
  const response = await fetchJSON(
        withCacheBust(
      `${API_BASE}/items/${TABLES.clientes}?limit=-1&sort[]=name&fields=id,name,CUIT,status`,
      cacheBust,
    ),
  )
  return response?.data ?? []
}

const buildInFilter = (field, ids) => {
  const query = new URLSearchParams()
  query.append(`filter[${field}][_in]`, ids.join(','))
  return query
}

const fetchManagerCustomerDetail = async (customerId) => {
  const cacheBust = Date.now().toString()
  const customerResponse = await fetchJSON(
        withCacheBust(
      `${API_BASE}/items/${TABLES.clientes}/${customerId}?fields=id,name,CUIT,status`,
      cacheBust,
    ),
  )

  const sitesResponse = await fetchJSON(
    withCacheBust(
      `${API_BASE}/items/${TABLES.sites}?${new URLSearchParams({
        'filter[idCliente][_eq]': String(customerId),
        'sort[]': 'nombre',
        fields: 'id,nombre,status,urlSlug,idCliente',
      }).toString()}`,
      cacheBust,
    ),
  )

  const sites = sitesResponse?.data ?? []
  const siteIds = sites.map((site) => site.id).filter(Boolean)

 let requirementsResponse = { data: [] }
  if (siteIds.length) {
    const requirementsQuery = new URLSearchParams({
      'sort[]': 'nombre',
      fields: 'id,nombre,status,fechaInicio,fechaProyectadaFin,idSites',
    })
    requirementsQuery.append('filter[idSites][_in]', siteIds.join(','))
    requirementsResponse = await fetchJSON(
      withCacheBust(
        `${API_BASE}/items/${TABLES.requerimientos}?${requirementsQuery.toString()}`,
        cacheBust,
      ),
    )
    if (!requirementsResponse?.data?.length) {
      const fallbackQuery = new URLSearchParams({
        'sort[]': 'nombre',
        fields: 'id,nombre,status,fechaInicio,fechaProyectadaFin,idSites',
      })
      fallbackQuery.append('filter[idSites][id][_in]', siteIds.join(','))
      requirementsResponse = await fetchJSON(
        withCacheBust(
          `${API_BASE}/items/${TABLES.requerimientos}?${fallbackQuery.toString()}`,
          cacheBust,
        ),
      )
    }
  }
  
  const requirements = requirementsResponse?.data ?? []
  const requirementIds = requirements.map((req) => req.id).filter(Boolean)

  let providersResponse = { data: [] }
  if (requirementIds.length) {
    const providerQuery = new URLSearchParams({
      'sort[]': 'nombre',
      fields: 'id,nombre,name,razonSocial,CUIT,status,idRequerimientos',
    })
    providerQuery.append(
      'filter[idRequerimientos][_in]',
      requirementIds.join(','),
    )
    providersResponse = await fetchJSON(
      withCacheBust(
        `${API_BASE}/items/${TABLES.proveedores}?${providerQuery.toString()}`,
        cacheBust,
      ),
    )
  }

  const providers = providersResponse?.data ?? []
  const providerIds = providers.map((provider) => provider.id).filter(Boolean)

  const personasResponse = providerIds.length
    ? await safeFetchJSON(
        withCacheBust(
          `${API_BASE}/items/${TABLES.personas}?${new URLSearchParams({
            ...Object.fromEntries(buildInFilter('idProveedor', providerIds)),
            'sort[]': 'nombre',
            fields: 'id,nombre,apellido,DNI,idProveedor',
          }).toString()}`,
          cacheBust,
        ),
      )
    : { data: [] }

  const vehiculosResponse = providerIds.length
    ? await safeFetchJSON(
        withCacheBust(
          `${API_BASE}/items/${TABLES.vehiculos}?${new URLSearchParams({
            ...Object.fromEntries(buildInFilter('idProveedor', providerIds)),
            'sort[]': 'dominio',
            fields: 'id,dominio,marca,modelo,idProveedor',
          }).toString()}`,
          cacheBust,
        ),
      )
    : { data: [] }

  const personas = personasResponse?.data ?? []
  const vehiculos = vehiculosResponse?.data ?? []

  const documentoQuery = new URLSearchParams({
    'sort[]': 'nombre',
    fields:
      'id,nombre,descripcion,status,idProveedor,idPersona,idVehiculo,fechaPresentacion,proximaFechaPresentacion',
  })
  if (providerIds.length) {
    documentoQuery.append('filter[idProveedor][_in]', providerIds.join(','))
  }
  const personaIds = personas.map((persona) => persona.id).filter(Boolean)
  if (personaIds.length) {
    documentoQuery.append('filter[idPersona][_in]', personaIds.join(','))
  }
  const vehiculoIds = vehiculos.map((vehiculo) => vehiculo.id).filter(Boolean)
  if (vehiculoIds.length) {
    documentoQuery.append('filter[idVehiculo][_in]', vehiculoIds.join(','))
  }

  const documentosResponse =
    providerIds.length || personaIds.length || vehiculoIds.length
      ? await safeFetchJSON(
          withCacheBust(
            `${API_BASE}/items/${TABLES.documentos}?${documentoQuery.toString()}`,
            cacheBust,
          ),
        )
      : { data: [] }

  return {
    customer: customerResponse?.data ?? null,
    sites,
    requirements,
    providers,
    personas,
    vehiculos,
    documentos: documentosResponse?.data ?? [],
  }
}
const createCustomer = async (payload) => {
  const response = await postJSON(`${API_BASE}/items/${TABLES.clientes}`, payload)
  return response?.data
}

const createSite = async (payload) => {
  const response = await postJSON(`${API_BASE}/items/${TABLES.sites}`, payload)
  return response?.data
}

const createRequirement = async (payload) => {
  const response = await postJSON(
    `${API_BASE}/items/${TABLES.requerimientos}`,
    payload,
  )
  return response?.data
}

const createProvider = async (payload) => {
  const response = await postJSON(
    `${API_BASE}/items/${TABLES.proveedores}`,
    payload,
  )
  return response?.data
}
const createPersona = async (payload) => {
  const response = await postJSON(`${API_BASE}/items/${TABLES.personas}`, payload)
  return response?.data
}

const createVehiculo = async (payload) => {
  const response = await postJSON(
    `${API_BASE}/items/${TABLES.vehiculos}`,
    payload,
  )
  return response?.data
}

export {
  API_BASE,
  DIRECTUS_TOKEN,
  DASHBOARD_TABLES,
  TABLES,
  fetchJSON,
  fetchTableCount,
  fetchDashboardData,
  fetchCustomersPage,
  fetchManagerCustomers,
  fetchManagerCustomerDetail,
  createCustomer,
  createSite,
  createRequirement,
  createProvider,
  createPersona,
  createVehiculo,
}