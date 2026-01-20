import { Link } from 'react-router-dom'
import { ErrorBanner } from '../../components/Banner'
import Button from '../../components/Button'
import DataTable from '../../components/DataTable'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'

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
      <SearchBar
          value={customerSearch}
          placeholder="Buscar clientes..."
          onChange={onCustomerSearchChange}
        />
        <Link to="/clientes/nuevo" className="primary-button">
          Crear Cliente +
        </Link>
      </div>
      {customersError && (
        <ErrorBanner>
          No se pudo cargar el listado. {customersError}
        </ErrorBanner>
      )}
      <DataTable
        headers={[
          'Estado',
          'Nombre',
          'CUIT',
          'Contacto',
          'Mail',
          'Tel',
          'Mail Notif',
        ]}
        rows={filteredCustomers}
        renderRow={(cliente) => (
          <>
            <span>{getStatusLabel(cliente.status)}</span>
            <span>{cliente.name || 'Sin nombre'}</span>
            <span>{cliente.CUIT || '-'}</span>
            <span>{cliente.contacto || '-'}</span>
            <span>{cliente.mail || '-'}</span>
            <span>{cliente.tel || '-'}</span>
            <span>{cliente.mailNotif || '-'}</span>
          </>
        )}
        rowKey={(cliente) => cliente.id}
        isLoading={customersLoading}
        loadingMessage="Cargando clientes..."
        emptyMessage="No hay clientes disponibles."
        className="customers-table"
      />
      <Pagination
        currentPage={customersPage}
        totalPages={totalCustomerPages}
        onPageChange={onCustomersPageChange}
      />
    </section>
  )
}

export default CustomersPage