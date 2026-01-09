import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE =
  import.meta.env.VITE_DIRECTUS_URL ||
  (import.meta.env.DEV ? '/directus' : 'https://tto.com.ar')

const MENU_ITEMS = [
  'Home',
  'CustomersSICC',
  'Integral View',
  'Manager',
  'Sign Out',
]

const CUSTOMERS_PAGE_SIZE = 6

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

const getCountFromMeta = (payload) => {
  return Number(payload?.meta?.filter_count ?? 0)
}

const getStatusLabel = (value) => {
  if (!value) return 'Sin estado'
  return value.toString().replace(/_/g, ' ')
}

const getDocumentTitle = (documento) => {
  if (documento?.nombre || documento?.titulo || documento?.descripcion) {
    return (
      documento?.nombre ||
      documento?.titulo ||
      documento?.descripcion ||
      'Documento'
    )
  }
  if (documento?.idParametro) {
    return `Parámetro ${documento.idParametro}`
  }
  if (documento?.id) {
    return `Documento #${documento.id}`
  }
  return 'Documento'
}

const getDocumentSubtitle = (documento) => {
  return (
    documento?.detalle ||
    documento?.observaciones ||
    documento?.tipo ||
    documento?.status ||
    'Pendiente'
  )
}

const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || ''

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
const fetchTableCount = (table) => {
  return fetchJSON(
    `${API_BASE}/items/${table}?limit=1&meta=filter_count&fields=id`,
  )
}

const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const conicStops = data.reduce((acc, item) => {
    const start = acc.offset
    const slice = total ? (item.value / total) * 100 : 0
    const end = start + slice
    acc.stops.push(`${item.color} ${start}% ${end}%`)
    acc.offset = end
    return acc
  }, { offset: 0, stops: [] })

  return (
    <div className="pie-chart">
      <div
        className="pie"
        style={{
          background: `conic-gradient(${conicStops.stops.join(', ')})`,
        }}
      />
      <div className="pie-legend">
        {data.map((item) => (
          <div key={item.label} className="pie-legend-item">
            <span className="pie-color" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const LoginScreen = ({ onLogin }) => {
  return (
    <div className="login-screen">
      <header className="login-header">
        <div className="logo">SICC</div>
      </header>
      <div className="login-card">
        <div className="login-copy">
          <h1>
            Bienvenido a SICC. Sistema Integral de Control de Contratistas.
          </h1>
          <p>
            Inicia sesión para acceder al panel de gestión documental.
          </p>
          <button type="button" className="primary-button" onClick={onLogin}>
            Entrar al Dashboard
          </button>
        </div>
        <div className="login-illustration">
          <div className="login-mockup" />
        </div>
      </div>
    </div>
  )
}

const Dashboard = ({
  activeView,
  counts,
  statusData,
  documentos,
  onRefresh,
  loading,
  error,
  onNavigate,
  customers,
  customersPage,
  customersTotal,
  customersLoading,
  customersError,
  customerSearch,
  onCustomerSearchChange,
  filteredCustomers,
  onCustomersPageChange,
  onCustomersRefresh,
}) => {
  const totalCustomerPages = Math.max(
    1,
    Math.ceil(customersTotal / CUSTOMERS_PAGE_SIZE),
  )

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">SICC</div>
        <nav className="sidebar-menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={`sidebar-link${
                activeView === item ? ' active' : ''
              }`}
              onClick={() => onNavigate(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main className="dashboard-content">
        {activeView === 'CustomersSICC' ? (
          <section className="customers-view">
            <header className="dashboard-header">
              <div>
                <h2>Clientes</h2>
                <p className="muted">
                  Listado de clientes registrados en el backend.
                </p>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={onCustomersRefresh}
              >
                Actualizar listado
              </button>
            </header>
            <div className="customers-toolbar">
              <div className="input-wrapper">
                <input
                  type="search"
                  placeholder="Buscar clientes..."
                  className="text-input"
                  value={customerSearch}
                  onChange={(event) =>
                    onCustomerSearchChange(event.target.value)
                  }
                />
              </div>
              <button type="button" className="primary-button">
                Crear Cliente +
              </button>
            </div>
            {customersError && (
              <div className="error-banner">
                No se pudo cargar el listado. {customersError}
              </div>
            )}
            <div className="customers-table">
              <div className="customers-row customers-header">
                <span>Estado</span>
                <span>Nombre</span>
                <span>CUIT</span>
                <span>Contacto</span>
                <span>Mail</span>
                <span>Tel</span>
                <span>Mail Notif</span>
              </div>
              {customersLoading && (
                <div className="customers-row">
                  <span className="muted">Cargando clientes...</span>
                </div>
              )}
              {!customersLoading && filteredCustomers.length === 0 && (
                <div className="customers-row">
                  <span className="muted">
                    No hay clientes disponibles.
                  </span>
                </div>
              )}
              {filteredCustomers.map((cliente) => (
                <div key={cliente.id} className="customers-row">
                  <span>{getStatusLabel(cliente.status)}</span>
                  <span>{cliente.name || 'Sin nombre'}</span>
                  <span>{cliente.CUIT || '-'}</span>
                  <span>{cliente.contacto || '-'}</span>
                  <span>{cliente.mail || '-'}</span>
                  <span>{cliente.tel || '-'}</span>
                  <span>{cliente.mailNotif || '-'}</span>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  onCustomersPageChange(Math.max(1, customersPage - 1))
                }
                disabled={customersPage <= 1}
              >
                ◀
              </button>
              {Array.from({ length: totalCustomerPages }, (_, index) => {
                const page = index + 1
                return (
                  <button
                    key={page}
                    type="button"
                    className={`page-button${
                      page === customersPage ? ' active' : ''
                    }`}
                    onClick={() => onCustomersPageChange(page)}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  onCustomersPageChange(
                    Math.min(totalCustomerPages, customersPage + 1),
                  )
                }
                disabled={customersPage >= totalCustomerPages}
              >
                ▶
              </button>
            </div>
          </section>
        ) : (
          <>
            <header className="dashboard-header">
              <h2>Dashboard</h2>
              <button
                type="button"
                className="ghost-button"
                onClick={onRefresh}
              >
                Actualizar información
              </button>
            </header>
            {error && (
              <div className="error-banner">
                No se pudo cargar la información del backend. {error}
              </div>
            )}
            <section className="stats-grid">
              <div className="stat-card">
                <span>Clientes</span>
                <strong>{counts.clientes}</strong>
              </div>
              <div className="stat-card">
                <span>Sites</span>
                <strong>{counts.sites}</strong>
              </div>
              <div className="stat-card">
                <span>Requerimientos</span>
                <strong>{counts.requerimientos}</strong>
              </div>
              <div className="stat-card">
                <span>Proveedores</span>
                <strong>{counts.proveedores}</strong>
              </div>
            </section>
            <section className="dashboard-panels">
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Documentos por estado</h3>
                  {loading && <span className="muted">Cargando...</span>}
                </div>
                <PieChart data={statusData} />
              </div>
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Documentos a presentar</h3>
                </div>
                <div className="documents-list">
                  {documentos.length === 0 && (
                    <p className="muted">
                      No hay documentos próximos para presentar.
                    </p>
                  )}
                  {documentos.map((documento) => (
                    <div key={documento.id} className="document-row">
                      <div>
                        <strong>{getDocumentTitle(documento)}</strong>
                        <p>{getDocumentSubtitle(documento)}</p>
                      </div>
                      <span className="pill">
                        {getStatusLabel(documento.estado)}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-link"
                  onClick={onRefresh}
                >
                  Actualizar la información
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeView, setActiveView] = useState('Home')
  const [counts, setCounts] = useState({
    clientes: 0,
    sites: 0,
    requerimientos: 0,
    proveedores: 0,
  })
  const [statusData, setStatusData] = useState([])
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState([])
  const [customersPage, setCustomersPage] = useState(1)
  const [customersTotal, setCustomersTotal] = useState(0)
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customersError, setCustomersError] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  const colors = useMemo(
    () => ['#22c55e', '#f97316', '#3b82f6', '#ef4444', '#a855f7'],
    [],
  )
  const filteredCustomers = useMemo(() => customers, [customers])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
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

      setCounts({
        clientes: getCountFromMeta(clientesResponse),
        sites: getCountFromMeta(sitesResponse),
        requerimientos: getCountFromMeta(requerimientosResponse),
        proveedores: getCountFromMeta(proveedoresResponse),
      })

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
          label: getStatusLabel(estado),
          value: Number(count ?? 0),
          color: colors[index % colors.length],
        }),
      )
      setStatusData(
        statusRows.length
          ? statusRows
          : [
              {
                label: 'Pendiente',
                value: 0,
                color: colors[0],
              },
            ],
      )

      setDocumentos(documentosListResponse?.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async (page, searchTerm = '') => {
    setCustomersLoading(true)
    setCustomersError('')
    try {
      const trimmedSearch = searchTerm.trim()
      const query = new URLSearchParams({
        limit: String(CUSTOMERS_PAGE_SIZE),
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
      setCustomers(response?.data ?? [])
      setCustomersTotal(getCountFromMeta(response))
    } catch (err) {
      setCustomersError(err.message)
    } finally {
      setCustomersLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn && activeView === 'Home') {
      loadDashboardData()
    }
  }, [isLoggedIn, activeView])

  useEffect(() => {
    if (isLoggedIn && activeView === 'CustomersSICC') {
      loadCustomers(customersPage, customerSearch)
    }
  }, [isLoggedIn, activeView, customersPage, customerSearch])

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <Dashboard
      activeView={activeView}
      counts={counts}
      statusData={statusData}
      documentos={documentos}
      onRefresh={loadDashboardData}
      loading={loading}
      error={error}
      onNavigate={(view) => {
        if (view === 'Sign Out') {
          setIsLoggedIn(false)
          setActiveView('Home')
          return
        }
        setActiveView(view)
      }}
      customers={customers}
      customersPage={customersPage}
      customersTotal={customersTotal}
      customersLoading={customersLoading}
      customersError={customersError}
      customerSearch={customerSearch}
      onCustomerSearchChange={(value) => {
        setCustomerSearch(value)
        setCustomersPage(1)
      }}
      filteredCustomers={filteredCustomers}
      onCustomersPageChange={setCustomersPage}
      onCustomersRefresh={() => loadCustomers(customersPage, customerSearch)}
    />
  )
}

export default App
