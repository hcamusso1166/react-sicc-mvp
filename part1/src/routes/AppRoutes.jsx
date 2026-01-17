import { Route, Routes } from 'react-router-dom'

import CustomersPage from '../pages/CustomersSICC'
import CreateCustomer from '../pages/CustomersSICC/CreateCustomer'
import CreateProvider from '../pages/CustomersSICC/CreateProveedor'
import CreatePersona from '../pages/CustomersSICC/CreatePersona'
import CreateRequirement from '../pages/CustomersSICC/CreateRequirement'
import CreateSite from '../pages/CustomersSICC/CreateSite'
import CreateVehiculo from '../pages/CustomersSICC/CreateVehiculo'
import DeleteCustomer from '../pages/CustomersSICC/DeleteCustomer'
import EditCustomer from '../pages/CustomersSICC/EditCustomer'
import SuccessCustomer from '../pages/CustomersSICC/SuccessCustomer'
import SuccessPersona from '../pages/CustomersSICC/SuccessPersona'
import SuccessRequerimient from '../pages/CustomersSICC/SuccessRequerimient'
import SuccessSite from '../pages/CustomersSICC/SuccessSite'
import SuccessVehiculo from '../pages/CustomersSICC/SuccessVehiculo'
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
      <Route path="/clientes/nuevo/successcli" element={<SuccessCustomer />} />
      <Route path="/clientes/site/nuevo" element={<CreateSite />} />
      <Route path="/clientes/site/success" element={<SuccessSite />} />
      <Route
        path="/clientes/site/requerimiento/nuevo"
        element={<CreateRequirement />}
      />
      <Route path="/clientes/proveedor/nuevo" element={<CreateProvider />} />
      <Route
        path="/clientes/proveedor/persona/nuevo"
        element={<CreatePersona />}
      />
      <Route
        path="/clientes/proveedor/persona/success"
        element={<SuccessPersona />}
      />
      <Route
        path="/clientes/proveedor/vehiculo/nuevo"
        element={<CreateVehiculo />}
      />
      <Route
        path="/clientes/proveedor/vehiculo/success"
        element={<SuccessVehiculo />}
      />
      <Route
        path="/clientes/requerimiento/success"
        element={<SuccessRequerimient />}
      />
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