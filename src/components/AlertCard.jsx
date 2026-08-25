function AlertCard({ alert }) {
  if (!alert) return null;

  const isAlert = alert.severity === 'RED ALERT' || alert.severity === 'ORANGE ALERT' || alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
  const isModerate = alert.severity === 'YELLOW ALERT' || alert.severity === 'WARNING' || alert.severity === 'MEDIUM';
  
  // Dynamic header title
  const headerTitle = isAlert ? 'CURRENT DISASTER ALERT' : (isModerate ? 'WEATHER WARNING' : 'CURRENT WEATHER');
  
  // Dynamic border color
  const borderColor = isAlert ? 'var(--red)' : (isModerate ? 'var(--orange)' : 'var(--blue)');
  
  // Dynamic title text color
  const titleColor = isAlert ? 'var(--red)' : (isModerate ? 'var(--orange)' : 'var(--navy)');

  // Dynamic chip class
  const chipClass = isAlert 
    ? 'chip-critical' 
    : (isModerate ? 'chip-warning' : 'chip-info');

  const icon = isAlert || isModerate ? '\u26A0\uFE0F ' : '\u26C5 ';

  return (
    <div className="card" style={{ padding: 18, borderLeft: `4px solid ${borderColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.02em' }}>
          {headerTitle}
        </h3>
        {alert.isMock ? (
          <span className="chip chip-neutral">PROTOTYPE DATA</span>
        ) : (
          <span className="chip chip-info" style={{ fontSize: 11 }}>LIVE OPENWEATHER</span>
        )}
      </div>

      <p style={{ fontSize: 17, fontWeight: 800, color: titleColor, marginBottom: 4 }}>
        {icon}{alert.title}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        Affected Area: {alert.area}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span className={`chip ${chipClass}`}>{alert.severity}</span>
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

      {alert.isMock ? (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          This is mock data for the prototype. A live IMD/weather API can be connected here later.
        </p>
      ) : (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          Live weather data provided by OpenWeather API.
        </p>
      )}
    </div>
  )
}

export default AlertCard
