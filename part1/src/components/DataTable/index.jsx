const DataTable = ({
  headers = [],
  rows = [],
  renderRow = () => null,
  rowKey,
  isLoading = false,
  loadingMessage = 'Cargando...',
  emptyMessage = 'No hay datos disponibles.',
  className = '',
  rowClassName = '',
  headerRowClassName = '',
}) => {
  const rootClassName = ['data-table', className].filter(Boolean).join(' ')
  const sharedRowClassName = ['data-table-row', rowClassName]
    .filter(Boolean)
    .join(' ')
  const headerClassName = [
    'data-table-row',
    'data-table-header',
    rowClassName,
    headerRowClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName}>
      <div className={headerClassName}>
        {headers.map((header, index) => (
          <span key={`${header}-${index}`}>{header}</span>
        ))}
      </div>
      {isLoading && (
        <div className={sharedRowClassName}>
          <span className="muted">{loadingMessage}</span>
        </div>
      )}
      {!isLoading && rows.length === 0 && (
        <div className={sharedRowClassName}>
          <span className="muted">{emptyMessage}</span>
        </div>
      )}
      {!isLoading &&
        rows.map((row, index) => (
          <div
            key={rowKey ? rowKey(row, index) : index}
            className={sharedRowClassName}
          >
            {renderRow(row, index)}
          </div>
        ))}
    </div>
  )
}

export default DataTable