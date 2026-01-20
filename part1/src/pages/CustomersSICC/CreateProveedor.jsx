import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import FormActions from '../../components/Form/FormActions'
import FormField from '../../components/Form/FormField'
import FormGrid from '../../components/Form/FormGrid'
import SelectInput from '../../components/Form/SelectInput'
import TextInput from '../../components/Form/TextInput'
import { createProvider } from '../../services/directus'
import slugify from '../../utils/slugify'
import { isBlank } from '../../utils/validation'

const STATUS_OPTIONS = [
  { label: 'Publicado', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivado', value: 'archived' },
]

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
    if (isBlank(values.status)) {
      errors.status = 'Seleccioná un estado.'
    }
    if (isBlank(values.nombre)) {
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
          <FormGrid>
            <FormField label="Cliente">
              <TextInput type="text" value={customerName} disabled />
            </FormField>
            <FormField label="Site">
              <TextInput type="text" value={siteName} disabled />
            </FormField>
            <FormField label="Requerimiento">
              <TextInput type="text" value={requirementName} disabled />
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
            <FormField label="Nombre del proveedor" error={formErrors.nombre}>
              <TextInput
                type="text"
                value={formState.nombre}
                onChange={(event) => updateField('nombre', event.target.value)}
                placeholder="Nombre..."
                maxLength={120}
                required
              />
            </FormField>
            <FormField label="CUIT" error={formErrors.cuit}>
              <TextInput
                type="text"
                value={formState.cuit}
                onChange={(event) => updateField('cuit', event.target.value)}
                placeholder="NN-NNNNNNNN-N"
                maxLength={20}
              />
            </FormField>
          </FormGrid>
          <FormActions>
            <Button as={Link} to="/manager" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar proveedor'}
            </Button>
          </FormActions>
        </form>
      </div>
    </section>
  )
}

export default CreateProvider