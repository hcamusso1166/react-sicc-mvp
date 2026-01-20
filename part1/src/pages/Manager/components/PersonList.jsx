const PersonList = ({ personas, getPersonName, getPersonaDocumento }) => {
  if (personas.length === 0) {
    return <p className="muted">No hay personas registradas.</p>
  }

  return (
    <ul>
      {personas.map((persona) => (
        <li key={persona.id}>
          <strong>{getPersonName(persona)}</strong>
          <span className="muted">DNI: {getPersonaDocumento(persona)}</span>
        </li>
      ))}
    </ul>
  )
}

export default PersonList