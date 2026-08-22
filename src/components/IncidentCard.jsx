const severityChip = {
  Critical: 'chip-critical',
  High: 'chip-high',
  Medium: 'chip-medium',
  Low: 'chip-low'
}

function IncidentCard({ incident }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p style={{ fontWeight: 800, fontSize: 15 }}>{incident.id}</p>
        <span className={`chip ${severityChip[incident.severity]}`}>{incident.severity}</span>
      </div>
      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{incident.type}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{incident.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{incident.sector}</span>
        <span>{incident.reportedTime}</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <span className={`chip ${incident.status === 'Assigned' ? 'chip-info' : 'chip-neutral'}`}>
          {incident.status}
        </span>
      </div>
    </div>
  )
}

export default IncidentCard
