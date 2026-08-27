function StatsCard({ label, value, accent }) {
  return (
    <div className="card dash-stat-card" style={{ padding: '18px 20px', flex: 1, minWidth: 140, borderTop: `4px solid ${accent || 'var(--navy)'}` }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color: accent || 'var(--navy)', letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  )
}

export default StatsCard
