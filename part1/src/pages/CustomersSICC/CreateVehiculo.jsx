import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'

import { createVehiculo } from '../../services/directus'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

const CreateVehiculo = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const customer = location.state?.customer
  const site = location.state?.site
  const requirement = location.state?.requirement
  const provider = location.state?.provider

  const customerName = customer?.name || 'cliente'
  const siteName = site?.nombre || 'site'
  const requirementName = requirement?.nombre || 'requerimiento'
  const providerName = provider?.nombre || provider?.razonSocial || 'proveedor'
  const providerId = provider?.id
  const customerId = customer?.id

  const [formState, setFormState] = useState({
    status: STATUS_OPTIONS[0].value,
    dominio: '',
    marca: '',
    modelo: '',
    color: '',
    observaciones: '',
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
    if (values.dominio.trim().length > 20) {
      errors.dominio = 'El dominio no puede superar 20 caracteres.'
    }
    if (values.marca.trim().length > 120) {
      errors.marca = 'La marca no puede superar 120 caracteres.'
    }
    if (values.modelo.trim().length > 120) {
      errors.modelo = 'El modelo no puede superar 120 caracteres.'
    }
    if (values.color.trim().length > 60) {
      errors.color = 'El color no puede superar 60 caracteres.'
    }
    if (values.observaciones.trim().length > 255) {
      errors.observaciones = 'Las observaciones no pueden superar 255 caracteres.'
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
    if (!providerId) {
      setSubmitError('No se encontró el proveedor asociado al vehículo.')
      return
    }

    setSubmitting(true)
    try {
      await createVehiculo({
        status: formState.status,
        dominio: formState.dominio.trim() || null,
        marca: formState.marca.trim() || null,
        modelo: formState.modelo.trim() || null,
        color: formState.color.trim() || null,
        observaciones: formState.observaciones.trim() || null,
        idProveedor: providerId,
      })
      navigate('/clientes/proveedor/vehiculo/success', {
        replace: true,
        state: { customer, site, requirement, provider },
      })
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
          <h2>Nuevo vehículo</h2>
          <p className="muted">
            Asociado al cliente {customerName}, al site {siteName}, al
            requerimiento {requirementName} y al proveedor {providerName}.
          </p>
        </div>
      </header>
      <div className="panel-card">
        {!providerId && (
          <div className="error-banner">
            No se detectó un proveedor para asociar el vehículo.
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
              <input className="text-input" type="text" value={siteName} disabled />
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
              <span className="form-label">Proveedor</span>
              <input
                className="text-input"
                type="text"
                value={providerName}
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
            <label className="form-field compact">
              <span className="form-label">Dominio</span>
              <input
                className="text-input"
                type="text"
                value={formState.dominio}
                onChange={(event) => updateField('dominio', event.target.value)}
                placeholder="AAANNN/AAANNNA"
                maxLength={20}
              />
              {formErrors.dominio && (
                <span className="field-error">{formErrors.dominio}</span>
              )}
            </label>
            <label className="form-field compact">
              <span className="form-label">Marca</span>
              <input
                className="text-input"
                type="text"
                value={formState.marca}
                onChange={(event) => updateField('marca', event.target.value)}
                placeholder="Marca..."
                maxLength={120}
              />
              {formErrors.marca && (
                <span className="field-error">{formErrors.marca}</span>
              )}
            </label>
            <label className="form-field compact">
              <span className="form-label">Modelo</span>
              <input
                className="text-input"
                type="text"
                value={formState.modelo}
                onChange={(event) => updateField('modelo', event.target.value)}
                placeholder="Modelo..."
                maxLength={120}
              />
              {formErrors.modelo && (
                <span className="field-error">{formErrors.modelo}</span>
              )}
            </label>
            <label className="form-field compact">
              <span className="form-label">Color</span>
              <input
                className="text-input"
                type="text"
                value={formState.color}
                onChange={(event) => updateField('color', event.target.value)}
                placeholder="Color..."
                maxLength={60}
              />
              {formErrors.color && (
                <span className="field-error">{formErrors.color}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Observaciones</span>
              <input
                className="text-input"
                type="text"
                value={formState.observaciones}
                onChange={(event) => updateField('observaciones', event.target.value)}
                placeholder="Observaciones..."
                maxLength={255}
              />
              {formErrors.observaciones && (
                <span className="field-error">{formErrors.observaciones}</span>
              )}
            </label>
          </div>
          <div className="form-actions">
            <Link
              className="secondary-button"
              to={customerId ? `/manager?customerId=${customerId}` : '/manager'}
            >
              Cancelar
            </Link>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar vehículo'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CreateVehiculo