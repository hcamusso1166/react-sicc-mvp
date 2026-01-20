import StatusPill from '../StatusPill'

const getDocumentTitle = (documento) => {
  if (documento?.nombre || documento?.titulo || documento?.descripcion) {
    return (
      documento?.nombre ||
      documento?.titulo ||
      documento?.descripcion ||
      'Documento'
    )
  }
  if (documento?.idParametro) {
    return `Parámetro ${documento.idParametro}`
  }
  if (documento?.id) {
    return `Documento #${documento.id}`
  }
  return 'Documento'
}

const getDocumentSubtitle = (documento) => {
  return (
    documento?.detalle ||
    documento?.observaciones ||
    documento?.tipo ||
    documento?.status ||
    'Pendiente'
  )
}

const DocumentList = ({
  documentos = [],
  onStatusLabel,
  emptyMessage = 'No hay documentos próximos para presentar.',
}) => {
  return (
    <div className="documents-list">
      {documentos.length === 0 && <p className="muted">{emptyMessage}</p>}
      {documentos.map((documento) => (
        <div key={documento.id} className="document-row">
          <div>
            <strong>{getDocumentTitle(documento)}</strong>
            <p>{getDocumentSubtitle(documento)}</p>
          </div>
          <StatusPill>
            {onStatusLabel ? onStatusLabel(documento.estado) : documento.estado}
          </StatusPill>
        </div>
      ))}
    </div>
  )
}

export default DocumentList