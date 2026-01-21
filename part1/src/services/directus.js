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
  documentosPersonas: 'documentosRequeridosPersonas',
  documentosVehiculos: 'documentosRequeridosVehiculos',
  parametrosDocumentosRequeridosProveedor: 'parametrosDocumentosRequeridosProveedor',
  personas: 'persona',
  tiposDocumentos: 'tiposDocumentos',
  vehiculos: 'vehiculo',
}

const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, {
    cache: 'no-store',
    signal: options.signal,
    headers: DIRECTUS_TOKEN
      ? {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`,
          ...options.headers,
        }
      : options.headers,
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

const safeFetchJSON = async (url, options) => {
  try {
    return await fetchJSON(url, options)
  } catch (error) {
    return { data: [], error }
  }
}

const getRelationId = (value) => {
  if (Array.isArray(value)) {
    return value[0]?.id ?? value[0]
  }
  if (value && typeof value === 'object') {
    return value.id
  }
  return value
}
const postJSON = async (url, payload, options = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(DIRECTUS_TOKEN
        ? {
            Authorization: `Bearer ${DIRECTUS_TOKEN}`,
          }
        : {}),
      ...options.headers,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json()
}

const fetchTableCount = (table, options = {}) => {
  const { cacheBust, ...fetchOptions } = options
  return fetchJSON(
    withCacheBust(
      `${API_BASE}/items/${table}?limit=1&meta=filter_count&fields=id`,
      cacheBust,
    ),
    fetchOptions,
  )
}

const getCountFromMeta = (payload) => {
  return Number(payload?.meta?.filter_count ?? 0)
}

const getStatusLabelFallback = (value) => {
  if (!value) return 'Sin estado'
  return value.toString().replace(/_/g, ' ')
}

const fetchDashboardData = async ({ colors, getStatusLabel, signal }) => {
  const labelFormatter = getStatusLabel || getStatusLabelFallback
  const cacheBust = Date.now().toString()
  const [
    clientesResponse,
    sitesResponse,
    requerimientosResponse,
    proveedoresResponse,
    documentosStatusResponse,
    documentosListResponse,
  ] = await Promise.all([
    fetchTableCount(DASHBOARD_TABLES.clientes, { signal, cacheBust }),
    fetchTableCount(DASHBOARD_TABLES.sites, { signal, cacheBust }),
    fetchTableCount(DASHBOARD_TABLES.requerimientos, { signal, cacheBust }),
    fetchTableCount(DASHBOARD_TABLES.proveedores, { signal, cacheBust }),
    fetchJSON(
      withCacheBust(
        `${API_BASE}/items/${TABLES.documentos}?groupBy[]=status&aggregate[count]=*`,
        cacheBust,
      ),
      { signal },
    ),
    fetchJSON(
      withCacheBust(
        `${API_BASE}/items/${TABLES.documentos}?limit=5&sort[]=proximaFechaPresentacion&fields=id,status,idParametro,idProveedor,proximaFechaPresentacion,fechaPresentacion`,
        cacheBust,
      ),
      { signal },
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

const fetchCustomersPage = async ({
  page,
  searchTerm = '',
  pageSize,
  signal,
}) => {
  const cacheBust = Date.now().toString()
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
    withCacheBust(
      `${API_BASE}/items/${TABLES.clientes}?${query.toString()}`,
      cacheBust,
    ),
    { signal },
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
  const personaIds = personas.map((persona) => persona.id).filter(Boolean)
  const vehiculoIds = vehiculos.map((vehiculo) => vehiculo.id).filter(Boolean)
  const documentoFields =
    'id,status,idProveedor,idPersona,idVehiculo,idParametro,fechaPresentacion,proximaFechaPresentacion'
  const buildDocumentoQuery = (field, ids, useNestedId = false) => {
    const query = new URLSearchParams({
      'sort[]': 'id',
      fields: documentoFields,
    })
    const filterKey = useNestedId
      ? `filter[${field}][id][_in]`
      : `filter[${field}][_in]`
    query.append(filterKey, ids.join(','))
    return query
  }

  const fetchDocumentosByField = async (table, field, ids) => {
    if (!ids.length) return []
    const initialResponse = await safeFetchJSON(
      withCacheBust(
        `${API_BASE}/items/${table}?${buildDocumentoQuery(
          field,
          ids,
        ).toString()}`,
        cacheBust,
      ),
    )
    if (!initialResponse?.error) {
      return initialResponse?.data ?? []
    }
    const fallbackResponse = await safeFetchJSON(
      withCacheBust(
        `${API_BASE}/items/${table}?${buildDocumentoQuery(
          field,
          ids,
          true,
        ).toString()}`,
        cacheBust,
      ),
    )
    return fallbackResponse?.data ?? []
  }

  const documentosResponses = await Promise.all([
    fetchDocumentosByField(TABLES.documentos, 'idProveedor', providerIds),
    fetchDocumentosByField(TABLES.documentosPersonas, 'idPersona', personaIds),
    fetchDocumentosByField(
      TABLES.documentosVehiculos,
      'idVehiculo',
      vehiculoIds,
    ),
  ])

  const documentos = documentosResponses.flat()
  const documentosById = documentos.reduce((acc, documento) => {
    if (documento?.id) acc.set(documento.id, documento)
    return acc
  }, new Map())
  const documentosUnique = [...documentosById.values()]
  const documentoTipoIds = [
    ...new Set(
      documentosUnique
        .map((documento) => getRelationId(documento.idParametro))
        .filter(Boolean),
    ),
  ]
  const tiposDocumentosResponse = documentoTipoIds.length
    ? await safeFetchJSON(
        withCacheBust(
          `${API_BASE}/items/${TABLES.tiposDocumentos}?${new URLSearchParams({
            ...Object.fromEntries(buildInFilter('id', documentoTipoIds)),
            fields: 'id,nombreDocumento,validezDocumentoDias',
          }).toString()}`,
          cacheBust,
        ),
      )
    : { data: [] }
  const tiposDocumentos = tiposDocumentosResponse?.data ?? []
  const tiposById = tiposDocumentos.reduce((acc, tipo) => {
    if (tipo?.id) acc.set(tipo.id, tipo)
    return acc
  }, new Map())
  const documentosEnriched = documentosUnique.map((documento) => {
    const tipo = tiposById.get(getRelationId(documento.idParametro))
    return tipo ? { ...documento, tipoDocumento: tipo } : documento
  })
 
  return {
    customer: customerResponse?.data ?? null,
    sites,
    requirements,
    providers,
    personas,
    vehiculos,
    documentos: documentosEnriched,
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

const createProviderRequiredDocuments = async ({
  providers,
  documentosByProvider,
  personasByProvider,
  vehiculosByProvider,
  documentosByPersona,
  documentosByVehiculo,
  signal,
}) => {
  const eligibleProviders = (providers || []).filter((provider) => {
    const providerDocs = documentosByProvider?.[provider.id] || []
    return providerDocs.length === 0
  })
  const skippedProviders = (providers || []).length - eligibleProviders.length

  const allPersonas = (providers || []).flatMap(
    (provider) => personasByProvider?.[provider.id] || [],
  )
  const allVehiculos = (providers || []).flatMap(
    (provider) => vehiculosByProvider?.[provider.id] || [],
  )

  const eligiblePersonas = allPersonas.filter((persona) => {
    const personaDocs = documentosByPersona?.[persona.id] || []
    return personaDocs.length === 0
  })
  const eligibleVehiculos = allVehiculos.filter((vehiculo) => {
    const vehiculoDocs = documentosByVehiculo?.[vehiculo.id] || []
    return vehiculoDocs.length === 0
  })
  const skippedPersonas = allPersonas.length - eligiblePersonas.length
  const skippedVehiculos = allVehiculos.length - eligibleVehiculos.length

  if (
    eligibleProviders.length === 0 &&
    eligiblePersonas.length === 0 &&
    eligibleVehiculos.length === 0
  ) {
    return {
      createdProviderDocs: 0,
      createdPersonaDocs: 0,
      createdVehiculoDocs: 0,
      providersProcessed: 0,
      personasProcessed: 0,
      vehiculosProcessed: 0,
      skippedProviders,
      skippedPersonas,
      skippedVehiculos,
      parametrosCount: 0,
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const parametrosQuery = new URLSearchParams({
    fields: 'id,idTipoDocumento,idTipoEntidad,fechaDesde,fechaHasta',
    'filter[idTipoEntidad][_in]': '1,2,3,4',
    'filter[fechaDesde][_lte]': today,
    'filter[fechaHasta][_gte]': today,
  })
  const parametrosResponse = await fetchJSON(
    `${API_BASE}/items/${
      TABLES.parametrosDocumentosRequeridosProveedor
    }?${parametrosQuery.toString()}`,
    { signal },
  )
  const parametros = parametrosResponse?.data ?? []

  const parametrosByEntidad = parametros.reduce((acc, parametro) => {
    const tipoEntidad = Number(
      getRelationId(parametro?.idTipoEntidad) ?? parametro?.idTipoEntidad ?? 0,
    )
    if (!acc[tipoEntidad]) acc[tipoEntidad] = []
    acc[tipoEntidad].push(parametro)
    return acc
  }, {})

  const providerParametros = [
    ...(parametrosByEntidad[1] || []),
    ...(parametrosByEntidad[2] || []),
  ]
  const personaParametros = parametrosByEntidad[3] || []
  const vehiculoParametros = parametrosByEntidad[4] || []

  const tipoDocumentoIds = [
    ...new Set(
      parametros
        .map((parametro) => getRelationId(parametro.idTipoDocumento))
        .filter(Boolean),
    ),
  ]
  if (tipoDocumentoIds.length === 0) {
    return {
      createdProviderDocs: 0,
      createdPersonaDocs: 0,
      createdVehiculoDocs: 0,
      providersProcessed: eligibleProviders.length,
      personasProcessed: eligiblePersonas.length,
      vehiculosProcessed: eligibleVehiculos.length,
      skippedProviders,
      skippedPersonas,
      skippedVehiculos,
      parametrosCount: parametros.length,
    }
  }

  const tiposQuery = new URLSearchParams({
    fields: 'id,nombreDocumento,validezDocumentoDias',
  })
  tiposQuery.append('filter[id][_in]', tipoDocumentoIds.join(','))
  const tiposResponse = await fetchJSON(
    `${API_BASE}/items/${TABLES.tiposDocumentos}?${tiposQuery.toString()}`,
    { signal },
  )
  const tiposDocumentos = tiposResponse?.data ?? []
  const tiposById = tiposDocumentos.reduce((acc, tipo) => {
    if (tipo?.id) acc.set(tipo.id, tipo)
    return acc
  }, new Map())

  const providerDocumentsToCreate = []
  const personaDocumentsToCreate = []
  const vehiculoDocumentsToCreate = []

  eligibleProviders.forEach((provider) => {
    providerParametros.forEach((parametro) => {
      const tipoId = getRelationId(parametro.idTipoDocumento)
      const tipoDocumento = tiposById.get(tipoId)
      if (!tipoDocumento) return
      providerDocumentsToCreate.push({
        status: 'toPresent',
        validezDias: tipoDocumento.validezDocumentoDias ?? null,
        idProveedor: provider.id,
        idParametro: tipoDocumento.id,
      })
    })
  })

  eligiblePersonas.forEach((persona) => {
    personaParametros.forEach((parametro) => {
      const tipoId = getRelationId(parametro.idTipoDocumento)
      const tipoDocumento = tiposById.get(tipoId)
      if (!tipoDocumento) return
      personaDocumentsToCreate.push({
        status: 'toPresent',
        validezDias: tipoDocumento.validezDocumentoDias ?? null,
        idPersona: persona.id,
        idParametro: tipoDocumento.id,
      })
    })
  })

  eligibleVehiculos.forEach((vehiculo) => {
    vehiculoParametros.forEach((parametro) => {
      const tipoId = getRelationId(parametro.idTipoDocumento)
      const tipoDocumento = tiposById.get(tipoId)
      if (!tipoDocumento) return
      vehiculoDocumentsToCreate.push({
        status: 'toPresent',
        validezDias: tipoDocumento.validezDocumentoDias ?? null,
        idVehiculo: vehiculo.id,
        idParametro: tipoDocumento.id,
      })
    })
  })

  if (
    !providerDocumentsToCreate.length &&
    !personaDocumentsToCreate.length &&
    !vehiculoDocumentsToCreate.length
  ) {
    return {
      createdProviderDocs: 0,
      createdPersonaDocs: 0,
      createdVehiculoDocs: 0,
      providersProcessed: eligibleProviders.length,
      personasProcessed: eligiblePersonas.length,
      vehiculosProcessed: eligibleVehiculos.length,
      skippedProviders,
      skippedPersonas,
      skippedVehiculos,
      parametrosCount: parametros.length,
    }
  }

  const createResponses = await Promise.all([
    providerDocumentsToCreate.length
      ? postJSON(
          `${API_BASE}/items/${TABLES.documentos}`,
          providerDocumentsToCreate,
          { signal },
        )
      : Promise.resolve({ data: [] }),
    personaDocumentsToCreate.length
      ? postJSON(
          `${API_BASE}/items/${TABLES.documentosPersonas}`,
          personaDocumentsToCreate,
          { signal },
        )
      : Promise.resolve({ data: [] }),
    vehiculoDocumentsToCreate.length
      ? postJSON(
          `${API_BASE}/items/${TABLES.documentosVehiculos}`,
          vehiculoDocumentsToCreate,
          { signal },
        )
      : Promise.resolve({ data: [] }),
  ])

    const [providerCreateResponse, personaCreateResponse, vehiculoCreateResponse] =
    createResponses
  const createdProviderDocs = providerDocumentsToCreate.length
  const createdPersonaDocs = personaDocumentsToCreate.length
  const createdVehiculoDocs = vehiculoDocumentsToCreate.length
  
  return {
    createdProviderDocs,
    createdPersonaDocs,
    createdVehiculoDocs,
    providersProcessed: eligibleProviders.length,
    personasProcessed: eligiblePersonas.length,
    vehiculosProcessed: eligibleVehiculos.length,
    skippedProviders,
    skippedPersonas,
    skippedVehiculos,
    parametrosCount: parametros.length,
    createdDocuments: [
      ...(providerCreateResponse?.data ?? []),
      ...(personaCreateResponse?.data ?? []),
      ...(vehiculoCreateResponse?.data ?? []),
    ],
  }
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
  createProviderRequiredDocuments,
  createPersona,
  createVehiculo,
}
