import { useEffect, useMemo, useState } from 'react'
import './App.css'
import DashboardLayout from './components/Layout/DashboardLayout'
import CustomersPage from './pages/CustomersSICC'
import HomePage from './pages/Home'

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
  const totalCustomerPages = Math.max(
    1,
    Math.ceil(customersTotal / CUSTOMERS_PAGE_SIZE),
  )

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
      <DashboardLayout
      menuItems={MENU_ITEMS}
      activeView={activeView}
      onNavigate={(view) => {
        if (view === 'Sign Out') {
          setIsLoggedIn(false)
          setActiveView('Home')
          return
        }
        setActiveView(view)
      }}
      >
      {activeView === 'CustomersSICC' ? (
        <CustomersPage
          customerSearch={customerSearch}
          onCustomerSearchChange={(value) => {
            setCustomerSearch(value)
            setCustomersPage(1)
          }}
          customersError={customersError}
          customersLoading={customersLoading}
          filteredCustomers={filteredCustomers}
          customersPage={customersPage}
          totalCustomerPages={totalCustomerPages}
          onCustomersPageChange={setCustomersPage}
          onCustomersRefresh={() => loadCustomers(customersPage, customerSearch)}
          getStatusLabel={getStatusLabel}
        />
      ) : (
        <HomePage
          counts={counts}
          statusData={statusData}
          documentos={documentos}
          onRefresh={loadDashboardData}
          loading={loading}
          error={error}
          onStatusLabel={getStatusLabel}
        />
      )}
    </DashboardLayout>
  )
}

export default App
