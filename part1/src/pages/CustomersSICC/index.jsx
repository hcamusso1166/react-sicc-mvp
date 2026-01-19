import { Link } from 'react-router-dom'
import { ErrorBanner } from '../../components/Banner'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'

const CustomersPage = ({
  customerSearch,
  onCustomerSearchChange,
  customersError,
  customersLoading,
  filteredCustomers,
  customersPage,
  totalCustomerPages,
  onCustomersPageChange,
  onCustomersRefresh,
  getStatusLabel,
}) => {
  return (
    <section className="customers-view">
      <PageHeader
        title="Clientes"
        subtitle="Listado de clientes registrados en el backend."
        actions={
          <Button type="button" variant="ghost" onClick={onCustomersRefresh}>
            Actualizar listado
          </Button>
        }
      />
      <div className="customers-toolbar">
        <div className="input-wrapper">
          <input
            type="search"
            placeholder="Buscar clientes..."
            className="text-input"
            value={customerSearch}
            onChange={(event) => onCustomerSearchChange(event.target.value)}
          />
        </div>
        <Link to="/clientes/nuevo" className="primary-button">
          Crear Cliente +
        </Link>
      </div>
      {customersError && (
        <ErrorBanner>
          No se pudo cargar el listado. {customersError}
        </ErrorBanner>
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
            <span className="muted">No hay clientes disponibles.</span>
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
        <Button
          type="button"
          variant="ghost"
          onClick={() => onCustomersPageChange(Math.max(1, customersPage - 1))}
          disabled={customersPage <= 1}
        >
          ◀
        </Button>
        {Array.from({ length: totalCustomerPages }, (_, index) => {
          const page = index + 1
          return (
            <Button
              key={page}
              type="button"
              variant="page"
              isActive={page === customersPage}
              onClick={() => onCustomersPageChange(page)}
            >
              {page}
            </Button>
          )
        })}
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            onCustomersPageChange(Math.min(totalCustomerPages, customersPage + 1))
          }
          disabled={customersPage >= totalCustomerPages}
        >
          ▶
        </Button>
      </div>
    </section>
  )
}

export default CustomersPage