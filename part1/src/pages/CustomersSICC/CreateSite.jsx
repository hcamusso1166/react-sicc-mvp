import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import FormActions from '../../components/Form/FormActions'
import FormField from '../../components/Form/FormField'
import FormGrid from '../../components/Form/FormGrid'
import SelectInput from '../../components/Form/SelectInput'
import TextInput from '../../components/Form/TextInput'
import { createSite } from '../../services/directus'
import slugify from '../../utils/slugify'
import { isBlank } from '../../utils/validation'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

const CreateSite = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const customer = location.state?.customer
  const customerId = customer?.id
  const customerName = customer?.name || 'cliente'

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
    if (isBlank(values.status)) {
      errors.status = 'Seleccioná un estado.'
    }
    if (isBlank(values.nombre)) {
      errors.nombre = 'El nombre es obligatorio.'
    } else if (values.nombre.trim().length > 100) {
      errors.nombre = 'El nombre no puede superar 100 caracteres.'
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
    if (!customerId) {
      setSubmitError('No se encontró el cliente asociado al Site.')
      return
    }

    setSubmitting(true)
    try {
      const urlSlug = slugify(formState.nombre) || formState.nombre.trim()
      const createdSite = await createSite({
        status: formState.status,
        nombre: formState.nombre.trim(),
        urlSlug,
        idCliente: customerId,
      })
      navigate('/clientes/site/success', {
        state: {
          customer: {
            id: customerId,
            name: customerName,
          },
          site: {
            id: createdSite?.id,
            nombre: createdSite?.nombre || formState.nombre.trim(),
            urlSlug,
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
        title="Nuevo Site"
        subtitle={`Completá los datos para registrar un Site del cliente ${customerName}.`}
      />
      <div className="panel-card">
        {!customerId && (
          <div className="error-banner">
            No se detectó un cliente para asociar el Site.
          </div>
        )}
        {submitError && <div className="error-banner">{submitError}</div>}
        <form className="customer-form" onSubmit={handleSubmit}>
          <FormGrid>
            <FormField label="Cliente">
              <TextInput type="text" value={customerName} disabled />
            </FormField>
            <FormField label="Estado" error={formErrors.status}>
              <SelectInput
                value={formState.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Nombre del Site" error={formErrors.nombre}>
              <TextInput
                type="text"
                value={formState.nombre}
                onChange={(event) => updateField('nombre', event.target.value)}
                placeholder="Nombre..."
                maxLength={100}
                required
              />
            </FormField>
          </FormGrid>
          <FormActions>             
            <Link className="secondary-button" to="/clientes">
              Cancelar
            </Link>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar Site'}
            </Button>
          </FormActions>
        </form>
      </div>
    </section>
  )
}

export default CreateSite