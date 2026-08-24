import React from 'react'

const columns = [
  {
    title: 'Shelter & Evacuation',
    icon: '🏠',
    accentColor: 'var(--blue)',
    fields: [
      { key: 'shelterReadiness', label: 'Shelter Space' },
      { key: 'rescueTeamReadiness', label: 'Rescue Personnel' },
      { key: 'boatsVehiclesReadiness', label: 'Boats & Vehicles' },
    ]
  },
  {
    title: 'Medical Operations',
    icon: '🏥',
    accentColor: 'var(--red)',
    fields: [
      { key: 'medicalUnitsReadiness', label: 'Medical Units' },
      { key: 'ambulancesReadiness', label: 'Ambulance Fleet' },
      { key: 'bedsReadiness', label: 'Hospital Beds' },
      { key: 'staffReadiness', label: 'Medical Staff' },
    ]
  },
  {
    title: 'Relief Stockpile',
    icon: '📦',
    accentColor: 'var(--green)',
    fields: [
      { key: 'foodPacketsReadiness', label: 'Food Packets' },
      { key: 'waterLitresReadiness', label: 'Clean Water' },
      { key: 'medicineKitsReadiness', label: 'Medicine Kits' },
      { key: 'blanketsReadiness', label: 'Blankets & Linens' },
    ]
  }
]

const getWarningText = (key, value) => {
  if (value >= 40) return null
  
  switch(key) {
    case 'shelterReadiness':
      return 'Max capacity limit near. Rerouting is required.'
    case 'rescueTeamReadiness':
      return 'Rescue teams deployed. Reserves active.'
    case 'boatsVehiclesReadiness':
      return 'Low vehicle availability.'
    case 'medicalUnitsReadiness':
    case 'ambulancesReadiness':
    case 'bedsReadiness':
    case 'staffReadiness':
      return 'Critical medical load. Resupply needed.'
    case 'foodPacketsReadiness':
    case 'waterLitresReadiness':
    case 'medicineKitsReadiness':
    case 'blanketsReadiness':
      return 'Inventory critical. Dispatch replenishment.'
    default:
      return 'Critical resource levels.'
  }
}

function ResourceReadiness({ data }) {
  if (!data) {
    return (
      <div className="card" style={{ padding: 20, marginTop: 14 }}>
        <h3 style={titleStyle}>
          <span style={{ marginRight: 6, fontSize: 15 }}>📋</span> Resource Readiness
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
          Loading resource readiness indicators...
        </p>
      </div>
    )
  }

  const renderField = (field) => {
    const rawVal = data[field.key]
    const pct = typeof rawVal === 'number' ? Math.round(rawVal) : 0
    const color = pct < 40 ? 'var(--red)' : pct < 75 ? 'var(--orange)' : 'var(--green)'
    const warning = getWarningText(field.key, pct)

    return (
      <div key={field.key} style={fieldContainerStyle}>
        <div style={fieldHeaderStyle}>
          <span style={fieldLabelStyle}>{field.label}</span>
          <span style={{ color: color, fontWeight: 700, fontSize: 12 }}>{pct}%</span>
        </div>
        <div style={progressContainerStyle}>
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${pct}%`, 
              background: color, 
              height: '100%', 
              borderRadius: 6,
            }} 
          />
        </div>
        {warning && (
          <p style={warningStyle}>
            ⚠️ {warning}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="card" style={mainCardStyle}>
      {/* Header */}
      <div style={headerContainerStyle}>
        <h3 style={titleStyle}>
          <span style={{ marginRight: 6, fontSize: 16 }}>📋</span> 
          Resource Readiness
        </h3>
        <span className="chip chip-low" style={{ fontSize: 11 }}>🟢 Live Sync</span>
      </div>

      {/* Grid of Sections */}
      <div style={gridStyle} className="readiness-grid">
        {columns.map((col, idx) => (
          <div 
            key={idx} 
            className="readiness-card"
            style={{ 
              ...subCardStyle, 
              borderTop: `4px solid ${col.accentColor}`
            }}
          >
            <h4 style={sectionHeaderStyle}>
              <span style={{ marginRight: 6 }}>{col.icon}</span>
              {col.title}
            </h4>
            <div style={fieldsListStyle}>
              {col.fields.map(renderField)}
            </div>
          </div>
        ))}
      </div>

      {/* Styles for animation, hover effects, and responsive grid */}
      <style>{`
        @keyframes progressGrow {
          from { width: 0%; }
        }
        .progress-bar-fill {
          animation: progressGrow 1s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        .readiness-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .readiness-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(11, 37, 69, 0.05);
        }
        @media (max-width: 992px) {
          .readiness-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

// Styling Object definitions
const mainCardStyle = {
  padding: '20px',
  marginTop: '14px',
  background: 'var(--card-bg)',
  boxShadow: 'var(--shadow)',
  border: '1px solid var(--border)'
}

const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '12px',
  marginBottom: '18px'
}

const titleStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.02em',
  display: 'flex',
  alignItems: 'center',
  textTransform: 'uppercase',
  margin: 0
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px'
}

const subCardStyle = {
  background: '#f8fafc', // Light slate grey card background
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
}

const sectionHeaderStyle = {
  fontSize: '12.5px',
  fontWeight: '700',
  color: 'var(--navy)',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  paddingBottom: '8px'
}

const fieldsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}

const fieldContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px'
}

const fieldHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const fieldLabelStyle = {
  fontSize: '11px',
  color: 'var(--text-main)',
  fontWeight: '600',
  letterSpacing: '0.01em'
}

const progressContainerStyle = {
  background: '#e2e8f0', // Clean slate bar container
  borderRadius: 6,
  height: '7px',
  overflow: 'hidden'
}

const warningStyle = {
  fontSize: '10px',
  color: 'var(--red)',
  marginTop: '2px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: 0
}

export default ResourceReadiness
