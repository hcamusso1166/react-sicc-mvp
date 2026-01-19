const FormGrid = ({ className = '', children }) => {
  return (
    <div className={['customer-form-grid', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export default FormGrid