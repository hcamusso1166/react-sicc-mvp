import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './App.css'
import DashboardLayout from './components/Layout/DashboardLayout'
import LoginPage from './pages/Login'
import AppRoutes from './routes/AppRoutes'
import { fetchCustomersPage, fetchDashboardData } from './services/directus'

const MENU_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Clientes', to: '/clientes' },
  { label: 'Integral View', to: '/integral-view' },
  {
    label: 'Reportes - Documentos a vencer',
    to: '/reportes/documentos-a-vencer',
  },
  {
    label: 'Reportes - Documentos verificados',
    to: '/reportes/documentos-verificados',
  },
  { label: 'Manager', to: '/manager' },
]

const CUSTOMERS_PAGE_SIZE = 6

const getStatusLabel = (value) => {
  if (!value) return 'Sin estado'
  return value.toString().replace(/_/g, ' ')
}

const App = () => {
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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
  const totalCustomerPages = Math.max(
    1,
    Math.ceil(customersTotal / CUSTOMERS_PAGE_SIZE),
  )

  const resetDashboardState = useCallback(() => {
    setCounts({
      clientes: 0,
      sites: 0,
      requerimientos: 0,
      proveedores: 0,
    })
    setStatusData([])
    setDocumentos([])
  }, [])

  const loadDashboardData = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    resetDashboardState()
    try {
      const {
        counts: nextCounts,
        statusData: nextStatusData,
        documentos: nextDocumentos,
      } = await fetchDashboardData({ colors, getStatusLabel, signal })
      setCounts(nextCounts)
      setStatusData(nextStatusData)
      setDocumentos(nextDocumentos)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
 }, [colors, resetDashboardState])

  const loadCustomers = useCallback(async (page, searchTerm = '', signal) => {
    setCustomersLoading(true)
    setCustomersError('')
    setCustomers([])
    setCustomersTotal(0)
    try {
      const { customers: nextCustomers, total } = await fetchCustomersPage({
        page,
        searchTerm,
        pageSize: CUSTOMERS_PAGE_SIZE,
        signal,
      })
      setCustomers(nextCustomers)
      setCustomersTotal(total)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setCustomersError(err.message)
      }
    } finally {
      setCustomersLoading(false)
    }
    }, [])

  useEffect(() => {
    if (isLoggedIn && location.pathname === '/') {
      const controller = new AbortController()
      loadDashboardData(controller.signal)
      return () => controller.abort()
    }
      return undefined
  }, [isLoggedIn, location.pathname, loadDashboardData])

  useEffect(() => {
    if (isLoggedIn && location.pathname === '/clientes') {
      const controller = new AbortController()
      loadCustomers(customersPage, customerSearch, controller.signal)
      return () => controller.abort()
    }
      return undefined
  }, [
    isLoggedIn,
    location.pathname,
    customersPage,
    customerSearch,
    loadCustomers,
  ])

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <DashboardLayout
      menuItems={MENU_ITEMS}
      onSignOut={() => {
        setIsLoggedIn(false)
        setCustomersPage(1)
        setCustomerSearch('')
        resetDashboardState()
        setCustomers([])
        setCustomersTotal(0)
        setCustomersError('')
        setError('')
      }}
    >
      <AppRoutes
        counts={counts}
        statusData={statusData}
        documentos={documentos}
        onRefresh={loadDashboardData}
        loading={loading}
        error={error}
        onStatusLabel={getStatusLabel}
        customerSearch={customerSearch}
        onCustomerSearchChange={(value) => {
          setCustomerSearch(value)
          setCustomersPage(1)
        }}
        customersError={customersError}
        customersLoading={customersLoading}
        filteredCustomers={customers}
        customersPage={customersPage}
        totalCustomerPages={totalCustomerPages}
        onCustomersPageChange={setCustomersPage}
        onCustomersRefresh={() =>
          loadCustomers(customersPage, customerSearch)
        }
        getStatusLabel={getStatusLabel}
      />
    </DashboardLayout>
  )
}

export default App
