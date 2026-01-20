import { ErrorBanner } from '../../components/Banner'
import Button from '../../components/Button'
import DocumentList from '../../components/DocumentList'
import PageHeader from '../../components/PageHeader'
import PanelCard from '../../components/PanelCard'
import PieChart from '../../components/PieChart'
import StatCard from '../../components/StatCard'

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
        <StatCard label="Clientes" value={counts.clientes} />
        <StatCard label="Sites" value={counts.sites} />
        <StatCard label="Requerimientos" value={counts.requerimientos} />
        <StatCard label="Proveedores" value={counts.proveedores} />
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
          <DocumentList documentos={documentos} onStatusLabel={onStatusLabel} />
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