const typeIcon = {
  'Rescue Team': '👨‍🚒',
  'Ambulance': '🚑',
  'Rescue Boat': '🚤',
  'Relief Supply': '📦',
  'Shelter': '🏠'
}

function ResourceCard({ resource, distance, onAssign, assigning }) {
  const isAvailable = resource.status === 'Available'

  return (
    <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: 14 }}>
          {typeIcon[resource.type] || '📍'} {resource.id}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {distance != null ? `${distance.toFixed(1)} km away` : resource.type}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span className={`chip ${isAvailable ? 'chip-low' : 'chip-neutral'}`}>{resource.status}</span>
        <button
          className="btn btn-secondary btn-small"
          onClick={() => onAssign(resource)}
          disabled={!isAvailable || assigning}
        >
          Assign
        </button>
      </div>
    </div>
  )
}

export default ResourceCard
