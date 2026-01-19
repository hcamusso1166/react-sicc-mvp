import PageHeader from '../../components/PageHeader'

const DeleteCustomer = () => {
  return (
    <section className="customers-view">
      <PageHeader
        title="Borrar cliente"
        subtitle="Confirmación pendiente de implementación."
      />
      <div className="card">
        <p className="muted">Aquí se renderizará la confirmación de baja.</p>
      </div>
    </section>
  )
}

export default DeleteCustomer