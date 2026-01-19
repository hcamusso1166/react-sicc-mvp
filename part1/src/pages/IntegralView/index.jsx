import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'

const IntegralViewPage = () => {
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')

  return (
    <section className="placeholder-view">
      <PageHeader title="Integral View" />
      <p className="muted">Sección en construcción.</p>
      <p>
        <strong>Customer ID:</strong> {customerId || 'No informado'}
      </p>
    </section>
  )
}

export default IntegralViewPage