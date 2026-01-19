const SelectInput = ({ className = '', children, ...props }) => {
  return (
    <select
      className={['text-input', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </select>
  )
}

export default SelectInput