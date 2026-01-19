import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'

import { createProvider } from '../../services/directus'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const CreateProvider = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const customer = location.state?.customer
  const site = location.state?.site
  const requirement = location.state?.requirement

  const customerName = customer?.name || 'cliente'
  const siteName = site?.nombre || 'site'
  const requirementName = requirement?.nombre || 'requerimiento'
  const requirementId = requirement?.id
  const customerId = customer?.id

  const [formState, setFormState] = useState({
    status: STATUS_OPTIONS[0].value,
    nombre: '',
    cuit: '',
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
    } else if (values.nombre.trim().length > 120) {
      errors.nombre = 'El nombre no puede superar 120 caracteres.'
    }
    if (values.cuit && values.cuit.trim().length > 20) {
      errors.cuit = 'El CUIT no puede superar 20 caracteres.'
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
    if (!requirementId) {
      setSubmitError('No se encontró el requerimiento asociado al proveedor.')
      return
    }

    setSubmitting(true)
    try {
      const urlSlug = slugify(formState.nombre) || formState.nombre.trim()
      await createProvider({
        status: formState.status,
        nombre: formState.nombre.trim(),
        CUIT: formState.cuit.trim() || null,
        idRequerimientos: requirementId,
        urlSlug,
      })
      if (customerId) {
        navigate(`/manager?customerId=${customerId}`, { replace: true })
      } else {
        navigate('/manager', { replace: true })
      }
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="customers-view">
      <PageHeader
        title="Nuevo proveedor"
        subtitle={`Asociado al cliente ${customerName}, al site ${siteName} y al requerimiento ${requirementName}.`}
      />
      <div className="panel-card">
        {!requirementId && (
          <div className="error-banner">
            No se detectó un requerimiento para asociar el proveedor.
          </div>
        )}
        {submitError && <div className="error-banner">{submitError}</div>}
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="customer-form-grid">
            <label className="form-field">
              <span className="form-label">Cliente</span>
              <input
                className="text-input"
                type="text"
                value={customerName}
                disabled
              />
            </label>
            <label className="form-field">
              <span className="form-label">Site</span>
              <input
                className="text-input"
                type="text"
                value={siteName}
                disabled
              />
            </label>
            <label className="form-field">
              <span className="form-label">Requerimiento</span>
              <input
                className="text-input"
                type="text"
                value={requirementName}
                disabled
              />
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
              <span className="form-label">Nombre del proveedor</span>
              <input
                className="text-input"
                type="text"
                value={formState.nombre}
                onChange={(event) => updateField('nombre', event.target.value)}
                placeholder="Nombre..."
                maxLength={120}
                required
              />
              {formErrors.nombre && (
                <span className="field-error">{formErrors.nombre}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">CUIT</span>
              <input
                className="text-input"
                type="text"
                value={formState.cuit}
                onChange={(event) => updateField('cuit', event.target.value)}
                placeholder="NN-NNNNNNNN-N"
                maxLength={20}
              />
              {formErrors.cuit && (
                <span className="field-error">{formErrors.cuit}</span>
              )}
            </label>
          </div>
          <div className="form-actions">
            <Link className="secondary-button" to="/manager">
              Cancelar
            </Link>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar proveedor'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CreateProvider