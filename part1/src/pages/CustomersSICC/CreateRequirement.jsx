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
    fechaInicio: '',
    fechaProyectadaFin: '',
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
          } else if (values.nombre.trim().length > 255) {
      errors.nombre = 'El nombre no puede superar 255 caracteres.'
    }
    if (!values.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es obligatoria.'
    }
    if (!values.fechaProyectadaFin) {
      errors.fechaProyectadaFin = 'La fecha fin proyectada es obligatoria.'
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
    if (!siteId) {
      setSubmitError('Faltan datos del site para el requerimiento.')
      return
    }

    setSubmitting(true)
    try {
      await createRequirement({
        status: formState.status,
        nombre: formState.nombre.trim(),
        fechaInicio: formState.fechaInicio,
        fechaProyectadaFin: formState.fechaProyectadaFin,
        idSites: siteId,
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
                maxLength={255}
                required
              />
              {formErrors.nombre && (
                <span className="field-error">{formErrors.nombre}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Fecha de inicio</span>
              <input
                className="text-input"
                type="date"
                value={formState.fechaInicio}
                onChange={(event) => updateField('fechaInicio', event.target.value)}
                required
              />
              {formErrors.fechaInicio && (
                <span className="field-error">{formErrors.fechaInicio}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Fecha fin proyectada</span>
              <input
                className="text-input"
                type="date"
                value={formState.fechaProyectadaFin}
                onChange={(event) =>
                  updateField('fechaProyectadaFin', event.target.value)
                }
                required
              />
              {formErrors.fechaProyectadaFin && (
                <span className="field-error">
                  {formErrors.fechaProyectadaFin}
                </span>
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