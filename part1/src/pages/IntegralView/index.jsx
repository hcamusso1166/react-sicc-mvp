import { useSearchParams } from 'react-router-dom'

const IntegralViewPage = () => {
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')

  return (
    <section className="placeholder-view">
      <header className="dashboard-header">
        <h2>Integral View</h2>
      </header>
      <p className="muted">Sección en construcción.</p>
      <p>
        <strong>Customer ID:</strong> {customerId || 'No informado'}
      </p>
    </section>
  )
}

export default IntegralViewPage