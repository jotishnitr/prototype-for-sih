// Small stat box used at the top of the dashboard
function StatsCard({ label, value, accent }) {
  return (
    <div className="card" style={{ padding: '18px 20px', flex: 1, minWidth: 140 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color: accent || 'var(--navy)' }}>{value}</p>
    </div>
  )
}

export default StatsCard
