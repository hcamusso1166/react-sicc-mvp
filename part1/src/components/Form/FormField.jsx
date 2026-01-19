const FormField = ({
  label,
  error,
  children,
  className = '',
  labelClassName = '',
}) => {
  return (
    <label className={['form-field', className].filter(Boolean).join(' ')}>
      {label ? (
        <span className={['form-label', labelClassName].filter(Boolean).join(' ')}>
          {label}
        </span>
      ) : null}
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}

export default FormField