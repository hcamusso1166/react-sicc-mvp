import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'

import { createPersona } from '../../services/directus'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

const CreatePersona = () => {
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
    nombre: '',
    apellido: '',
    dni: '',
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
    if (!values.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio.'
    } else if (values.apellido.trim().length > 120) {
      errors.apellido = 'El apellido no puede superar 120 caracteres.'
    }
    const dniValue = values.dni.trim()
    if (!dniValue) {
      errors.dni = 'El DNI es obligatorio.'
    } else if (!/^\d+$/.test(dniValue)) {
      errors.dni = 'El DNI debe ser numérico.'
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
      setSubmitError('No se encontró el proveedor asociado a la persona.')
      return
    }

    setSubmitting(true)
    try {
      await createPersona({
        status: formState.status,
        nombre: formState.nombre.trim(),
        apellido: formState.apellido.trim(),
        DNI: Number(formState.dni.trim()),
        idProveedor: providerId,
      })
      navigate('/clientes/proveedor/persona/success', {
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
      <PageHeader
        title="Nueva persona"
        subtitle={`Asociada al cliente ${customerName}, al site ${siteName}, al requerimiento ${requirementName} y al proveedor ${providerName}.`}
      />
      <div className="panel-card">
        {!providerId && (
          <div className="error-banner">
            No se detectó un proveedor para asociar la persona.
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
              <span className="form-label">Nombre</span>
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
            <label className="form-field compact">
              <span className="form-label">Apellido</span>
              <input
                className="text-input"
                type="text"
                value={formState.apellido}
                onChange={(event) => updateField('apellido', event.target.value)}
                placeholder="Apellido..."
                maxLength={120}
                required
              />
              {formErrors.apellido && (
                <span className="field-error">{formErrors.apellido}</span>
              )}
            </label>
            <label className="form-field compact">
              <span className="form-label">DNI</span>
              <input
                className="text-input"
                type="text"
                value={formState.dni}
                onChange={(event) => updateField('dni', event.target.value)}
                placeholder="N..."
                inputMode="numeric"
                required
              />
              {formErrors.dni && (
                <span className="field-error">{formErrors.dni}</span>
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
              {submitting ? 'Guardando...' : 'Guardar persona'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CreatePersona