import React from 'react'

const typeIcon = {
  'rescue_team': '👨‍🚒',
  'rescue team': '👨‍🚒',
  'ambulance': '🚑',
  'medical_unit': '🏥',
  'medical unit': '🏥',
  'rescue_boat': '🚤',
  'rescue boat': '🚤',
  'relief_supply': '📦',
  'relief supply': '📦',
  'supply_depot': '📦',
  'shelter': '🏠'
}

function ResourceCard({ resource, distance, onAssign, assigning, onDelete }) {
  const isAvailable = resource.status?.toLowerCase() === 'available'
  
  // Format type label
  const displayType = resource.type
    ? resource.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Resource'

  // Get specific capacity/readiness details based on resource type
  let capacityInfo = null
  if (resource.type === 'shelter' && resource.shelter) {
    capacityInfo = `Capacity: ${resource.shelter.capacity_remaining} / ${resource.shelter.capacity_total} vacant`
  } else if (resource.type === 'rescue_team' && resource.rescue_team) {
    capacityInfo = `Members: ${resource.rescue_team.available_members} / ${resource.rescue_team.total_members} ready`
  } else if (resource.type === 'medical_unit' && resource.medical_unit) {
    capacityInfo = `Ambulances: ${resource.medical_unit.available_ambulances} | Beds: ${resource.medical_unit.available_beds}`
  }

  return (
    <div className="card" style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ flex: 1 }}>
          <p style={nameStyle}>
            {typeIcon[resource.type?.toLowerCase()] || '📍'} {resource.name || resource.id || 'Unnamed Resource'}
          </p>
          <p style={typeAndDistanceStyle}>
            {displayType} {distance != null ? `• ${distance.toFixed(1)} km away` : ''}
          </p>
        </div>
        <span className={`chip ${isAvailable ? 'chip-low' : 'chip-neutral'}`} style={badgeStyle}>
          {resource.status}
        </span>
      </div>

      {/* Additional Details (Address, Contact Phone, Readiness details) */}
      {(resource.location?.address || resource.location?.contact_phone || capacityInfo) && (
        <div style={detailsPanelStyle}>
          {capacityInfo && (
            <p style={{ margin: 0, fontWeight: 600 }}>
              📈 {capacityInfo}
            </p>
          )}
          {resource.location?.address && (
            <p style={{ margin: 0 }}>
              📍 {resource.location.address}
            </p>
          )}
          {resource.location?.contact_phone && (
            <p style={{ margin: 0 }}>
              📞 {resource.location.contact_phone}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        {onDelete && (
          <button
            className="btn btn-small"
            onClick={() => onDelete(resource)}
            style={{ padding: '5px 12px', fontSize: '11px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
          >
            🗑️ Delete
          </button>
        )}
        {onAssign && (
          <button
            className="btn btn-secondary btn-small"
            onClick={() => onAssign(resource)}
            disabled={!isAvailable || assigning}
            style={assignButtonStyle}
          >
            Assign Resource
          </button>
        )}
      </div>
    </div>
  )
}

// Styling Object definitions
const containerStyle = {
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  background: '#ffffff',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)'
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '10px'
}

const nameStyle = {
  fontWeight: '700',
  fontSize: '13px',
  color: 'var(--navy)',
  margin: 0
}

const typeAndDistanceStyle = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  marginTop: '2px',
  margin: 0
}

const badgeStyle = {
  fontSize: '9.5px',
  padding: '2px 6px',
  textTransform: 'uppercase',
  fontWeight: '700'
}

const detailsPanelStyle = {
  background: 'var(--bg)',
  padding: '8px 10px',
  borderRadius: '6px',
  fontSize: '11px',
  color: 'var(--text-main)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  lineHeight: '1.3'
}

const assignButtonStyle = {
  alignSelf: 'flex-end',
  padding: '5px 12px',
  fontSize: '11px',
  marginTop: '2px'
}

export default ResourceCard
