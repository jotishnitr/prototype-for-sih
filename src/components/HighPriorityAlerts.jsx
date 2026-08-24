import { useEffect, useState } from 'react'

const getTimeAgo = (dateString) => {
  if (!dateString) return 'Just now'
  const now = new Date()
  const created = new Date(dateString)
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `-${diffMins} mins`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `-${diffHours} mins`
  return created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getAlertConfig = (type, severity, title) => {
  const normType = type ? type.toLowerCase() : ''
  const normSeverity = severity ? severity.toLowerCase() : ''
  const titleLower = title ? title.toLowerCase() : ''

  // Breach
  if (normType === 'breach' || titleLower.includes('breach') || normSeverity === 'critical') {
    return {
      label: 'BREACH PROTOCOL',
      color: 'var(--red)',
      borderColor: 'var(--red)',
      requiresAuth: true
    }
  }
  // Resource Warning
  if (normType === 'resource_warning' || titleLower.includes('capacity') || normSeverity === 'warning') {
    return {
      label: 'RESOURCE WARNING',
      color: 'var(--orange)',
      borderColor: 'var(--orange)',
      requiresAuth: false
    }
  }
  // Unit Deployed
  if (normType === 'unit_deployed' || titleLower.includes('deployed') || titleLower.includes('en route') || titleLower.includes('team')) {
    return {
      label: 'UNIT DEPLOYED',
      color: 'var(--blue)',
      borderColor: 'var(--blue)',
      requiresAuth: false
    }
  }
  // System Update
  if (normType === 'system_update' || titleLower.includes('update') || titleLower.includes('relay') || titleLower.includes('online')) {
    return {
      label: 'SYSTEM UPDATE',
      color: 'var(--text-muted)',
      borderColor: 'var(--text-muted)',
      requiresAuth: false
    }
  }

  // General fallbacks
  if (normSeverity === 'critical' || normSeverity === 'high') {
    return {
      label: 'CRITICAL ALERT',
      color: 'var(--red)',
      borderColor: 'var(--red)',
      requiresAuth: false
    }
  }

  return {
    label: type ? type.replace('_', ' ').toUpperCase() : 'ALERT LOG',
    color: 'var(--blue)',
    borderColor: 'var(--blue)',
    requiresAuth: false
  }
}

function HighPriorityAlerts({ alerts }) {
  const [ticker, setTicker] = useState(0)

  // Force component update every 15s to update "time ago" stamps
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((t) => t + 1)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card" style={cardStyle}>
      {/* Header */}
      <div style={headerContainerStyle}>
        <div style={titleStyle}>
          <span style={{ marginRight: 6 }}>🔔</span>
          High-Priority Alerts
        </div>
        <div style={liveBadgeStyle}>
          <span style={liveDotStyle}></span>
          LIVE
        </div>
      </div>

      {/* Alerts list */}
      <div style={listStyle} className="custom-scrollbar">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert) => {
            const config = getAlertConfig(alert.type, alert.severity, alert.title)
            return (
              <div 
                key={alert._id || alert.id} 
                style={{ 
                  ...alertCardStyle, 
                  borderLeft: `4px solid ${config.borderColor}` 
                }}
              >
                <div style={alertHeaderStyle}>
                  <span style={{ ...alertTagStyle, color: config.color }}>
                    {config.label}
                  </span>
                  <span style={timeStyle}>
                    {getTimeAgo(alert.createdAt)}
                  </span>
                </div>
                <p style={messageStyle}>
                  {alert.message || alert.title}
                </p>
                {config.requiresAuth && (
                  <div style={requiresAuthStyle}>
                    REQUIRES AUTH
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div style={emptyStateStyle}>
            No high-priority alerts recorded.
          </div>
        )}
      </div>

      {/* Bottom View Logs link */}
      <div style={bottomContainerStyle}>
        <a href="#logs" style={viewLogsLinkStyle}>
          VIEW ALL LOGS
        </a>
      </div>

      {/* Inline styles for scrolling and animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c6cfd8;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        @keyframes livePulse {
          0% { transform: scale(0.85); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

// Styling Object definitions
const cardStyle = {
  padding: '18px',
  color: 'var(--text-main)',
  background: 'var(--card-bg)'
}

const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '12px',
  marginBottom: '14px'
}

const titleStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.02em',
  display: 'flex',
  alignItems: 'center',
  textTransform: 'uppercase'
}

const liveBadgeStyle = {
  background: 'var(--red)',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '800',
  padding: '3px 8px',
  borderRadius: '3px',
  letterSpacing: '0.05em',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
}

const liveDotStyle = {
  width: '6px',
  height: '6px',
  background: '#ffffff',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'livePulse 1.5s infinite ease-in-out'
}

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxHeight: '280px',
  overflowY: 'auto',
  paddingRight: '4px'
}

const alertCardStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
}

const alertHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const alertTagStyle = {
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.04em'
}

const timeStyle = {
  fontSize: '11px',
  color: 'var(--text-muted)'
}

const messageStyle = {
  fontSize: '13px',
  color: 'var(--text-main)',
  lineHeight: '1.4',
  fontWeight: '500'
}

const requiresAuthStyle = {
  alignSelf: 'flex-start',
  marginTop: '4px',
  background: 'var(--red-bg)',
  border: '1px solid rgba(225, 60, 60, 0.25)',
  color: 'var(--red)',
  fontSize: '9px',
  fontWeight: '700',
  letterSpacing: '0.04em',
  padding: '2px 6px',
  borderRadius: '3px'
}

const emptyStateStyle = {
  textAlign: 'center',
  padding: '20px 0',
  color: 'var(--text-muted)',
  fontSize: '13px'
}

const bottomContainerStyle = {
  textAlign: 'center',
  marginTop: '14px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)'
}

const viewLogsLinkStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--navy)',
  letterSpacing: '0.05em',
  textDecoration: 'none',
  cursor: 'pointer'
}

export default HighPriorityAlerts
