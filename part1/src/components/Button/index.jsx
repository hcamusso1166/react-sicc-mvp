const VARIANT_CLASSES = {
  primary: 'primary-button',
  secondary: 'secondary-button',
  ghost: 'ghost-button',
  text: 'text-link',
  page: 'page-button',
}

const Button = ({
  as: Component = 'button',
  type = 'button',
  variant = 'primary',
  size,
  isActive = false,
  className = '',
  children,
  ...props
}) => {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
  const sizeClass = size ? ` ${size}` : ''
  const activeClass = isActive ? ' active' : ''
  const classes = `${variantClass}${sizeClass}${activeClass}`.trim()
  const componentProps = {
    className: [classes, className].filter(Boolean).join(' '),
    ...props,
  }

  if (Component === 'button') {
    componentProps.type = type
  }

  return (
    <Component {...componentProps}>{children}</Component>
  )
}

export default Button