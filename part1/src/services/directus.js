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
}

const fetchJSON = async (url) => {
  const response = await fetch(url, {
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
    query.append('filter[name][_contains]', trimmedSearch)
  }
  const response = await fetchJSON(
    `${API_BASE}/items/${TABLES.clientes}?${query.toString()}`,
  )

  return {
    customers: response?.data ?? [],
    total: getCountFromMeta(response),
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

export {
  API_BASE,
  DIRECTUS_TOKEN,
  DASHBOARD_TABLES,
  TABLES,
  fetchJSON,
  fetchTableCount,
  fetchDashboardData,
  fetchCustomersPage,
  createCustomer,
  createSite,
  createRequirement,
}