import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'

import { createCustomer } from '../../services/directus'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CUIT_PATTERN = /^\d{2}-\d{8}-\d$/
const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const CreateCustomer = () => {
  const navigate = useNavigate()
  const [formState, setFormState] = useState({
    status: STATUS_OPTIONS[0].value,
    name: '',
    contacto: '',
    mail: '',
    tel: '',
    mailNotif: '',
    CUIT: '',
    calle: '',
    nro: '',
    piso: '',
    dpto: '',
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
    if (!values.name.trim()) {
      errors.name = 'El nombre es obligatorio.'
    }
    if (!values.contacto.trim()) {
      errors.contacto = 'El contacto es obligatorio.'
    }
    if (!values.mail.trim()) {
      errors.mail = 'El mail es obligatorio.'
    } else if (!EMAIL_PATTERN.test(values.mail.trim())) {
      errors.mail = 'Ingresá un mail válido.'
    }
    if (!values.tel.trim()) {
      errors.tel = 'El teléfono es obligatorio.'
    }
    if (!values.mailNotif.trim()) {
      errors.mailNotif = 'El mail de notificación es obligatorio.'
    } else if (!EMAIL_PATTERN.test(values.mailNotif.trim())) {
      errors.mailNotif = 'Ingresá un mail válido.'
    }
    if (!values.CUIT.trim()) {
      errors.CUIT = 'El CUIT es obligatorio.'
    } else if (!CUIT_PATTERN.test(values.CUIT.trim())) {
      errors.CUIT = 'Usá el formato 0-00000000-0.'
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

    setSubmitting(true)
    try {
      const urlSlug = slugify(formState.name) || formState.name.trim()
      const createdCustomer = await createCustomer({
        status: formState.status,
        name: formState.name.trim(),
        urlSlug,
        contacto: formState.contacto.trim(),
        mail: formState.mail.trim(),
        tel: formState.tel.trim(),
        mailNotif: formState.mailNotif.trim(),
        CUIT: formState.CUIT.trim(),
        calle: formState.calle.trim() || null,
        nro: formState.nro.trim() || null,
        piso: formState.piso.trim() || null,
        dpto: formState.dpto.trim() || null,
      })
      navigate('/clientes/nuevo/successcli', {
        state: {
          customer: {
            id: createdCustomer?.id,
            name: createdCustomer?.name || formState.name.trim(),
          },
        },
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
        title="Nuevo cliente"
        subtitle="Completá los datos para registrar un nuevo cliente en el backend."
      />
      <div className="panel-card">
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="customer-form-grid">
            <label className="form-field">
              <span className="form-label">Nombre</span>
              <input
                className="text-input"
                type="text"
                value={formState.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Razón Social..."
                required
              />
              {formErrors.name && (
                <span className="field-error">{formErrors.name}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">CUIT</span>
              <input
                className="text-input"
                type="text"
                value={formState.CUIT}
                onChange={(event) => updateField('CUIT', event.target.value)}
                placeholder="NN-NNNNNNNN-N"
                required
              />
              {formErrors.CUIT && (
                <span className="field-error">{formErrors.CUIT}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Contacto</span>
              <input
                className="text-input"
                type="text"
                value={formState.contacto}
                onChange={(event) =>
                  updateField('contacto', event.target.value)
                }
                placeholder="Nombre..."
                required
              />
              {formErrors.contacto && (
                <span className="field-error">{formErrors.contacto}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Mail</span>
              <input
                className="text-input"
                type="email"
                value={formState.mail}
                onChange={(event) => updateField('mail', event.target.value)}
                placeholder="cliente@email.com"
                required
              />
              {formErrors.mail && (
                <span className="field-error">{formErrors.mail}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Tel</span>
              <input
                className="text-input"
                type="text"
                value={formState.tel}
                onChange={(event) => updateField('tel', event.target.value)}
                placeholder="Número..."
                required
              />
              {formErrors.tel && (
                <span className="field-error">{formErrors.tel}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Mail Notif</span>
              <input
                className="text-input"
                type="email"
                value={formState.mailNotif}
                onChange={(event) =>
                  updateField('mailNotif', event.target.value)
                }
                placeholder="notificaciones@email.com"
                required
              />
              {formErrors.mailNotif && (
                <span className="field-error">{formErrors.mailNotif}</span>
              )}
            </label>
            <label className="form-field">
              <span className="form-label">Estado</span>
              <select
                className="text-input"
                value={formState.status}
                onChange={(event) => updateField('status', event.target.value)}
                required
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
          </div>

          <div className="customer-form-grid">
            <label className="form-field">
              <span className="form-label">Calle</span>
              <input
                className="text-input"
                type="text"
                value={formState.calle}
                onChange={(event) => updateField('calle', event.target.value)}
                placeholder="Calle..."
              />
            </label>
            <label className="form-field">
              <span className="form-label">Nro</span>
              <input
                className="text-input"
                type="text"
                value={formState.nro}
                onChange={(event) => updateField('nro', event.target.value)}
                placeholder="Nro..."
              />
            </label>
            <label className="form-field">
              <span className="form-label">Piso</span>
              <input
                className="text-input"
                type="text"
                value={formState.piso}
                onChange={(event) => updateField('piso', event.target.value)}
                placeholder="Piso..."
              />
            </label>
            <label className="form-field">
              <span className="form-label">Dpto</span>
              <input
                className="text-input"
                type="text"
                value={formState.dpto}
                onChange={(event) => updateField('dpto', event.target.value)}
                placeholder="Dpto..."
              />
            </label>
          </div>

          {submitError && (
            <div className="error-banner">
              No se pudo registrar el cliente. {submitError}
            </div>
          )}

          <div className="form-actions">
            <Link to="/clientes" className="ghost-button">
              Cancelar
            </Link>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CreateCustomer