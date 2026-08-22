function AlertCard({ alert }) {
  return (
    <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--red)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.02em' }}>
          CURRENT DISASTER ALERT
        </h3>
        {alert.isMock && <span className="chip chip-neutral">PROTOTYPE DATA</span>}
      </div>

      <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--red)', marginBottom: 4 }}>
        ⚠️ {alert.title}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        Affected Area: {alert.area}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span className="chip chip-critical">{alert.severity}</span>
      </div>

      <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Wind</p>
          <p style={{ fontWeight: 700 }}>{alert.wind}</p>
        </div>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Rainfall</p>
          <p style={{ fontWeight: 700 }}>{alert.rainfall}</p>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
        This is mock data for the prototype. A live IMD/weather API can be connected here later.
      </p>
    </div>
  )
}

export default AlertCard
