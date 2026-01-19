import { ErrorBanner } from '../../components/Banner'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'

const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const conicStops = data.reduce(
    (acc, item) => {
      const start = acc.offset
      const slice = total ? (item.value / total) * 100 : 0
      const end = start + slice
      acc.stops.push(`${item.color} ${start}% ${end}%`)
      acc.offset = end
      return acc
    },
    { offset: 0, stops: [] },
  )

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

const HomePage = ({
  counts,
  statusData,
  documentos,
  onRefresh,
  loading,
  error,
  onStatusLabel,
}) => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <Button
            type="button"
            variant="ghost"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar información'}
          </Button>
        }
      />
      {error && (
        <ErrorBanner>
          No se pudo cargar la información del backend. {error}
        </ErrorBanner>
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
        <PanelCard>
          <div className="panel-header">
            <h3>Documentos por estado</h3>
            {loading && <span className="muted">Cargando...</span>}
          </div>
          <PieChart data={statusData} />
        </PanelCard>
        <PanelCard>
          <div className="panel-header">
            <h3>Documentos a presentar</h3>
          </div>
          <div className="documents-list">
            {documentos.length === 0 && (
              <p className="muted">No hay documentos próximos para presentar.</p>
            )}
            {documentos.map((documento) => (
              <div key={documento.id} className="document-row">
                <div>
                  <strong>{getDocumentTitle(documento)}</strong>
                  <p>{getDocumentSubtitle(documento)}</p>
                </div>
                <span className="pill">
                  {onStatusLabel(documento.estado)}
                </span>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="text"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar la información'}
          </Button>
        </PanelCard>
      </section>
    </>
  )
}

export default HomePage