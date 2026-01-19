const PageHeader = ({
  title,
  subtitle,
  actions,
  actionsClassName,
  className = '',
}) => {
  return (
    <header className={['dashboard-header', className].filter(Boolean).join(' ')}>
      <div>
        {typeof title === 'string' ? <h2>{title}</h2> : title}
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className={actionsClassName || 'page-header-actions'}>
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export default PageHeader