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

const TABLES = {
  clientes: 'Clientes',
  sites: 'sites',
  requerimientos: 'requerimiento',
  proveedores: 'proveedor',
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
  return (
    documento?.nombre ||
    documento?.titulo ||
    documento?.descripcion ||
    documento?.id ||
    'Documento'
  )
}

const getDocumentSubtitle = (documento) => {
  return (
    documento?.detalle ||
    documento?.observaciones ||
    documento?.tipo ||
    documento?.estado ||
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
  counts,
  statusData,
  documentos,
  onRefresh,
  loading,
  error,
}) => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">SICC</div>
        <nav className="sidebar-menu">
          {MENU_ITEMS.map((item) => (
            <button key={item} type="button" className="sidebar-link">
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h2>Dashboard</h2>
          <button type="button" className="ghost-button" onClick={onRefresh}>
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
            <button type="button" className="text-link" onClick={onRefresh}>
              Actualizar la información
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

const App = () => {
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

  const colors = useMemo(
    () => ['#22c55e', '#f97316', '#3b82f6', '#ef4444', '#a855f7'],
    [],
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
        fetchJSON(
          `${API_BASE}/items/${TABLES.clientes}?limit=1&meta=filter_count`,
        ),
        fetchJSON(`${API_BASE}/items/${TABLES.sites}?limit=1&meta=filter_count`),
        fetchJSON(
          `${API_BASE}/items/${TABLES.requerimientos}?limit=1&meta=filter_count`,
        ),
        fetchJSON(
          `${API_BASE}/items/${TABLES.proveedores}?limit=1&meta=filter_count`,
        ),
        fetchJSON(
          `${API_BASE}/items/${TABLES.documentos}?limit=1&meta=filter_count&groupBy[]=estado`,
        ),
        fetchJSON(
          `${API_BASE}/items/${TABLES.documentos}?limit=5&sort[]=fecha_vencimiento`,
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
        const key = row?.estado || 'Sin estado'
        acc[key] = (acc[key] || 0) + 1
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

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData()
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <Dashboard
      counts={counts}
      statusData={statusData}
      documentos={documentos}
      onRefresh={loadDashboardData}
      loading={loading}
      error={error}
    />
  )
}

export default App
