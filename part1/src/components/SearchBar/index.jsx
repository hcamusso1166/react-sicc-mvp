const SearchBar = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
  inputClassName = '',
  showIcon = false,
  icon = '🔍',
  ...props
}) => {
  const wrapperClassName = [
    'search-bar',
    showIcon ? 'search-bar--with-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inputClasses = ['text-input', inputClassName].filter(Boolean).join(' ')

  const handleChange = (event) => {
    onChange?.(event.target.value, event)
  }

  return (
    <div className={wrapperClassName}>
      {showIcon ? (
        <span className="search-bar__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <input
        type="search"
        placeholder={placeholder}
        className={inputClasses}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
}

export default SearchBar