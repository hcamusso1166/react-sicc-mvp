import { Route, Routes } from 'react-router-dom'

import CustomersPage from '../pages/CustomersSICC'
import CreateCustomer from '../pages/CustomersSICC/CreateCustomer'
import DeleteCustomer from '../pages/CustomersSICC/DeleteCustomer'
import EditCustomer from '../pages/CustomersSICC/EditCustomer'
import HomePage from '../pages/Home'
import IntegralViewPage from '../pages/IntegralView'
import ManagerPage from '../pages/Manager'
import DocumentosAVencerPage from '../pages/Reportes/DocumentosAVencer'
import DocumentosVerificadosPage from '../pages/Reportes/DocumentosVerificados'

const AppRoutes = ({
  counts,
  statusData,
  documentos,
  onRefresh,
  loading,
  error,
  onStatusLabel,
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
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            counts={counts}
            statusData={statusData}
            documentos={documentos}
            onRefresh={onRefresh}
            loading={loading}
            error={error}
            onStatusLabel={onStatusLabel}
          />
        }
      />
      <Route
        path="/clientes"
        element={
          <CustomersPage
            customerSearch={customerSearch}
            onCustomerSearchChange={onCustomerSearchChange}
            customersError={customersError}
            customersLoading={customersLoading}
            filteredCustomers={filteredCustomers}
            customersPage={customersPage}
            totalCustomerPages={totalCustomerPages}
            onCustomersPageChange={onCustomersPageChange}
            onCustomersRefresh={onCustomersRefresh}
            getStatusLabel={getStatusLabel}
          />
        }
      />
      <Route path="/clientes/nuevo" element={<CreateCustomer />} />
      <Route path="/clientes/:id/editar" element={<EditCustomer />} />
      <Route path="/clientes/:id/borrar" element={<DeleteCustomer />} />
      <Route path="/manager" element={<ManagerPage />} />
            <Route
        path="/reportes/documentos-a-vencer"
        element={<DocumentosAVencerPage />}
      />
      <Route
        path="/reportes/documentos-verificados"
        element={<DocumentosVerificadosPage />}
      />
      <Route path="/integral-view" element={<IntegralViewPage />} />
    </Routes>
  )
}

export default AppRoutes