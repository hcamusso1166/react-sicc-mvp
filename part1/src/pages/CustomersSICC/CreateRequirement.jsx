import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { createRequirement } from '../../services/directus'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

const CreateRequirement = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const customer = location.state?.customer
  const site = location.state?.site
  const customerName = customer?.name || 'cliente'
  const siteName = site?.nombre || 'site'
  const customerId = customer?.id
  const siteId = site?.id

  const [formState, setFormState] = useState({
    status: STATUS_OPTIONS[0].value,
    nombre: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const statusOptions = useMemo(() => STATUS_OPTIONS, [])

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const validate = (values) => {
    const errors = {}
    if (!values.status) {
      errors.status = 'Seleccioná un estado.'
    }
    if (!values.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio.'
    }
    return errors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    const nextErrors = validate(formState)
    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    if (!customerId || !siteId) {
      setSubmitError('Faltan datos del cliente o del site para el requerimiento.')
      return
    }

    setSubmitting(true)
    try {
      await createRequirement({
        status: formState.status,
        nombre: formState.nombre.trim(),
        idCliente: customerId,
        idSite: siteId,
      })
      navigate('/clientes', { replace: true })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="customers-view">
      <header className="dashboard-header">
        <div>
          <h2>Nuevo requerimiento</h2>
          <p className="muted">
            Asociado al cliente {customerName} y al site {siteName}.
          </p>
        </div>
      </header>
      <div className="panel-card">
        {submitError && <div className="error-banner">{submitError}</div>}
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="customer-form-grid">
            <label className="form-field">
              <span className="form-label">Cliente</span>
              <input className="text-input" type="text" value={customerName} disabled />
            </label>
            <label className="form-field">
              <span className="form-label">Site</span>
              <input className="text-input" type="text" value={siteName} disabled />
            </label>
            <label className="form-field">
              <span className="form-label">Estado</span>
              <select
                className="text-input"
                value={formState.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.status && (
                <span className="field-error">{formErrors.status}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Nombre del requerimiento</span>
              <input
                className="text-input"
                type="text"
                value={formState.nombre}
                onChange={(event) => updateField('nombre', event.target.value)}
                placeholder="Nombre..."
                required
              />
              {formErrors.nombre && (
                <span className="field-error">{formErrors.nombre}</span>
              )}
            </label>
          </div>
          <div className="form-actions">
            <Link className="secondary-button" to="/clientes">
              Cancelar
            </Link>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar requerimiento'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CreateRequirement