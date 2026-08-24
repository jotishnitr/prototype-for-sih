const severityChip = {
  Critical: 'chip-critical',
  High: 'chip-high',
  Medium: 'chip-medium',
  Low: 'chip-low',
  5: 'chip-critical',
  4: 'chip-high',
  3: 'chip-medium',
  2: 'chip-low',
  1: 'chip-low'
}

const severityTextMap = {
  5: 'Critical',
  4: 'High',
  3: 'Medium',
  2: 'Low',
  1: 'Low'
}

function IncidentCard({ incident }) {
  if (!incident) return null

  const idText = incident.id || (incident._id ? `INC-${String(incident._id).slice(-4).toUpperCase()}` : 'INC')

  const sevKey = typeof incident.severity === 'number'
    ? (severityTextMap[incident.severity] || 'Medium')
    : (incident.severity || 'Medium')

  const typeText = incident.type
    ? String(incident.type).charAt(0).toUpperCase() + String(incident.type).slice(1)
    : 'Incident'

  const statusText = incident.status === 'unallocated'
    ? 'Unassigned'
    : incident.status === 'allocated'
    ? 'Assigned'
    : (incident.status || 'Unassigned')

  const reportedTimeText = incident.reportedTime || (incident.createdAt
    ? new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently')

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p style={{ fontWeight: 800, fontSize: 15 }}>{idText}</p>
        <span className={`chip ${severityChip[sevKey] || 'chip-medium'}`}>{sevKey}</span>
      </div>

      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{typeText}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
        {incident.description || 'No description provided.'}
      </p>

      {incident.address && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          📍 <strong>Address:</strong> {incident.address}
        </p>
      )}

      {incident.reporter_phone && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          📞 <strong>Contact:</strong> {incident.reporter_phone}
        </p>
      )}

      {incident.resource_name && (
        <div style={{ background: '#f0f7ff', padding: 10, borderRadius: 6, margin: '8px 0', fontSize: 12 }}>
          <p style={{ fontWeight: 700, color: 'var(--blue)' }}>Assigned Resource:</p>
          <p><strong>Name:</strong> {incident.resource_name}</p>
          <p><strong>Type:</strong> {incident.resource_type}</p>
          {incident.resource_contact && <p><strong>Phone:</strong> {incident.resource_contact}</p>}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
        <span>{incident.sector || 'Sector Overview'}</span>
        <span>{reportedTimeText}</span>
      </div>

      <div style={{ marginTop: 10 }}>
        <span className={`chip ${statusText === 'Assigned' || statusText === 'allocated' ? 'chip-info' : 'chip-neutral'}`}>
          {statusText}
        </span>
      </div>
    </div>
  )
}

export default IncidentCard
