const PanelCard = ({ children, className }) => {
  return (
    <div className={['panel-card', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export default PanelCard