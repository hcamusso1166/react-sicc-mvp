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
      <header className="dashboard-header">
        <div>
          <h2>Clientes</h2>
          <p className="muted">Listado de clientes registrados en el backend.</p>
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
            onChange={(event) => onCustomerSearchChange(event.target.value)}
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
        <button
          type="button"
          className="ghost-button"
          onClick={() => onCustomersPageChange(Math.max(1, customersPage - 1))}
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
              className={`page-button${page === customersPage ? ' active' : ''}`}
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
            onCustomersPageChange(Math.min(totalCustomerPages, customersPage + 1))
          }
          disabled={customersPage >= totalCustomerPages}
        >
          ▶
        </button>
      </div>
    </section>
  )
}

export default CustomersPage