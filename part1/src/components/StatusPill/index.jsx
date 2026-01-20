const StatusPill = ({ className = '', children }) => {
  return (
    <span className={["pill", className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}

export default StatusPill