const VehicleList = ({ vehiculos, getVehicleName, getVehiculoField }) => {
  if (vehiculos.length === 0) {
    return <p className="muted">No hay vehículos registrados.</p>
  }

  return (
    <ul>
      {vehiculos.map((vehiculo) => (
        <li key={vehiculo.id}>
          <strong>{getVehicleName(vehiculo)}</strong>
          <span className="muted">
            Dominio: {getVehiculoField(vehiculo.dominio)}
          </span>
          <span className="muted">
            Marca: {getVehiculoField(vehiculo.marca)}
          </span>
          <span className="muted">
            Modelo: {getVehiculoField(vehiculo.modelo)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default VehicleList