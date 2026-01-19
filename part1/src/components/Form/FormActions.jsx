const FormActions = ({ className = '', children }) => {
  return (
    <div className={['form-actions', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export default FormActions