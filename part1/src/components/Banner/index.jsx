const buildClassName = (baseClassName, className) =>
  [baseClassName, className].filter(Boolean).join(' ')

export const ErrorBanner = ({ children, className }) => {
  return (
    <div className={buildClassName('error-banner', className)}>{children}</div>
  )
}

export const SuccessBanner = ({ children, className }) => {
  return (
    <div className={buildClassName('success-banner', className)}>{children}</div>
  )
}