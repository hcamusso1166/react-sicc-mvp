import { useEffect, useMemo, useState } from 'react'
import './App.css'
import DashboardLayout from './components/Layout/DashboardLayout'
import CustomersPage from './pages/CustomersSICC'
import HomePage from './pages/Home'
import { fetchCustomersPage, fetchDashboardData } from './services/directus'

const MENU_ITEMS = [
  'Home',
  'CustomersSICC',
  'Integral View',
  'Manager',
  'Sign Out',
]

const CUSTOMERS_PAGE_SIZE = 6

const getStatusLabel = (value) => {
  if (!value) return 'Sin estado'
  return value.toString().replace(/_/g, ' ')
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
      const { counts: nextCounts, statusData: nextStatusData, documentos: nextDocumentos } =
        await fetchDashboardData({ colors, getStatusLabel })
      setCounts(nextCounts)
      setStatusData(nextStatusData)
      setDocumentos(nextDocumentos)
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
      const { customers: nextCustomers, total } = await fetchCustomersPage({
        page,
        searchTerm,
        pageSize: CUSTOMERS_PAGE_SIZE,
      })
      setCustomers(nextCustomers)
      setCustomersTotal(total)
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
