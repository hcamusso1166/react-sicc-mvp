const PieChart = ({ data = [] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const conicStops = data.reduce(
    (acc, item) => {
      const start = acc.offset
      const slice = total ? (item.value / total) * 100 : 0
      const end = start + slice
      acc.stops.push(`${item.color} ${start}% ${end}%`)
      acc.offset = end
      return acc
    },
    { offset: 0, stops: [] },
  )

  return (
    <div className="pie-chart">
      <div
        className="pie"
        style={{
          background: `conic-gradient(${conicStops.stops.join(', ')})`,
        }}
      />
      <div className="pie-legend">
        {data.map((item) => (
          <div key={item.label} className="pie-legend-item">
            <span className="pie-color" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PieChart