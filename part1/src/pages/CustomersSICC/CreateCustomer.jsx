import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import FormActions from '../../components/Form/FormActions'
import FormField from '../../components/Form/FormField'
import FormGrid from '../../components/Form/FormGrid'
import SelectInput from '../../components/Form/SelectInput'
import TextInput from '../../components/Form/TextInput'
import { createCustomer } from '../../services/directus'
import slugify from '../../utils/slugify'
import { CUIT_PATTERN, EMAIL_PATTERN, isBlank } from '../../utils/validation'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

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
    if (isBlank(values.status)) {
      errors.status = 'Seleccioná un estado.'
    }
    if (isBlank(values.name)) {
      errors.name = 'El nombre es obligatorio.'
    }
    if (isBlank(values.contacto)) {
      errors.contacto = 'El contacto es obligatorio.'
    }
    if (isBlank(values.mail)) {
      errors.mail = 'El mail es obligatorio.'
    } else if (!EMAIL_PATTERN.test(values.mail.trim())) {
      errors.mail = 'Ingresá un mail válido.'
    }
    if (isBlank(values.tel)) {
      errors.tel = 'El teléfono es obligatorio.'
    }
    if (isBlank(values.mailNotif)) {
      errors.mailNotif = 'El mail de notificación es obligatorio.'
    } else if (!EMAIL_PATTERN.test(values.mailNotif.trim())) {
      errors.mailNotif = 'Ingresá un mail válido.'
    }
    if (isBlank(values.CUIT)) {
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
          <FormGrid>
            <FormField label="Nombre" error={formErrors.name}>
              <TextInput
                type="text"
                value={formState.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Razón Social..."
                required
              />
            </FormField>
            <FormField label="CUIT" error={formErrors.CUIT}>
              <TextInput
                type="text"
                value={formState.CUIT}
                onChange={(event) => updateField('CUIT', event.target.value)}
                placeholder="NN-NNNNNNNN-N"
                required
              />
            </FormField>
            <FormField label="Contacto" error={formErrors.contacto}>
              <TextInput
                type="text"
                value={formState.contacto}
                onChange={(event) => updateField('contacto', event.target.value)}
                placeholder="Nombre..."
                required
              />
            </FormField>
            <FormField label="Mail" error={formErrors.mail}>
              <TextInput
                type="email"
                value={formState.mail}
                onChange={(event) => updateField('mail', event.target.value)}
                placeholder="cliente@email.com"
                required
              />
            </FormField>
            <FormField label="Tel" error={formErrors.tel}>
              <TextInput
                type="text"
                value={formState.tel}
                onChange={(event) => updateField('tel', event.target.value)}
                placeholder="Número..."
                required
              />
            </FormField>
            <FormField label="Mail Notif" error={formErrors.mailNotif}>
              <TextInput
                type="email"
                value={formState.mailNotif}
                onChange={(event) =>
                  updateField('mailNotif', event.target.value)
                }
                placeholder="notificaciones@email.com"
                required
              />
            </FormField>
            <FormField label="Estado" error={formErrors.status}>
              <SelectInput
                value={formState.status}
                onChange={(event) => updateField('status', event.target.value)}
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          </FormGrid>            

          <FormGrid>
            <FormField label="Calle">
              <TextInput
                type="text"
                value={formState.calle}
                onChange={(event) => updateField('calle', event.target.value)}
                placeholder="Calle..."
              />
            </FormField>
            <FormField label="Nro">
              <TextInput
                type="text"
                value={formState.nro}
                onChange={(event) => updateField('nro', event.target.value)}
                placeholder="Nro..."
              />
            </FormField>
            <FormField label="Piso">
              <TextInput
                type="text"
                value={formState.piso}
                onChange={(event) => updateField('piso', event.target.value)}
                placeholder="Piso..."
              />
            </FormField>
            <FormField label="Dpto">
              <TextInput
                type="text"
                value={formState.dpto}
                onChange={(event) => updateField('dpto', event.target.value)}
                placeholder="Dpto..."
              />
            </FormField>
          </FormGrid>

          {submitError && (
            <div className="error-banner">
              No se pudo registrar el cliente. {submitError}
            </div>
          )}

          <FormActions>
            <Button as={Link} to="/clientes" variant="ghost">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </FormActions>
        </form>
      </div>
    </section>
  )
}

export default CreateCustomer