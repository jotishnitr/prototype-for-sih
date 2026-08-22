const icons = {
  critical: '🔴',
  assign: '🚑',
  shelter: '🏠',
  report: '📍',
  sms: '📩'
}

function ActivityFeed({ items }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <h3 style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.02em', marginBottom: 12 }}>
        LIVE ACTIVITY
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 10, fontSize: 13, alignItems: 'flex-start' }}>
            <span>{icons[item.type] || '•'}</span>
            <span style={{ color: 'var(--text-main)' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityFeed
