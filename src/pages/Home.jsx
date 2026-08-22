import { Link } from 'react-router-dom'

function Home() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: 'var(--navy)', color: '#fff', padding: '64px 0 72px' }}>
        <div className="container hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }}>
          <div>
            <span className="chip chip-critical" style={{ marginBottom: 18, display: 'inline-flex' }}>
              LIVE DISASTER RESPONSE SYSTEM
            </span>
            <h1 style={{ fontSize: 42, lineHeight: 1.15, marginBottom: 18 }}>
              Real-Time Disaster Response, Connected.
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 30, maxWidth: 480 }}>
              ResQGrid connects citizen reports, emergency resources and authorities through
              one live disaster-response platform.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/report" className="btn btn-primary">
                Report an Incident
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
                Open Authority Dashboard
              </Link>
            </div>
          </div>

          <MiniMapGraphic />
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ padding: '56px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} id="feature-grid">
          <FeatureCard
            icon="📍"
            title="Live Incident Monitoring"
            desc="Track geo-tagged incidents in real time as they are reported by citizens."
            color="var(--red)"
          />
          <FeatureCard
            icon="🚑"
            title="Smart Resource Allocation"
            desc="Find and assign the nearest available emergency resource in a few clicks."
            color="var(--blue)"
          />
          <FeatureCard
            icon="📶"
            title="Emergency Communication"
            desc="Support incident reporting even in low-connectivity areas through SMS."
            color="var(--green)"
          />
        </div>
      </section>

      <section id="about" style={{ padding: '0 0 64px' }}>
        <div className="container card" style={{ padding: 28, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>About ResQGrid</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              ResQGrid is a hackathon prototype built for PS-05: Real-Time Disaster Early-Warning
              and Resource Coordination Platform. It links citizen incident reports with a live
              map and helps authorities assign the nearest available team, ambulance, boat, or
              shelter to each incident.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <Stat label="Response goal" value="< 5 min" />
            <Stat label="Resource types" value="5" />
            <Stat label="Built for" value="PS-05" />
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          #feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="card" style={{ padding: 24, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55 }}>{desc}</p>
    </div>
  )
}

// A simple stylised map instead of a generic stock illustration
function MiniMapGraphic() {
  return (
    <div style={{ background: '#0f2f57', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
      <svg viewBox="0 0 400 280" width="100%" height="auto">
        <rect x="0" y="0" width="400" height="280" rx="8" fill="#0d2a4f" />
        {/* grid lines to suggest a map */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 35} x2="400" y2={i * 35} stroke="#1c3f6b" strokeWidth="1" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 35} y1="0" x2={i * 35} y2="280" stroke="#1c3f6b" strokeWidth="1" />
        ))}
        {/* road */}
        <path d="M20,220 C120,180 180,240 260,160 S360,100 390,60" stroke="#3a5a82" strokeWidth="6" fill="none" />

        {/* incident markers */}
        <circle cx="120" cy="90" r="8" fill="#e13c3c" stroke="#fff" strokeWidth="2" />
        <circle cx="230" cy="150" r="7" fill="#f2872e" stroke="#fff" strokeWidth="2" />
        <circle cx="300" cy="80" r="6" fill="#f0c419" stroke="#fff" strokeWidth="2" />
        <circle cx="90" cy="190" r="6" fill="#2fa860" stroke="#fff" strokeWidth="2" />

        {/* resource marker + connecting line */}
        <line x1="120" y1="90" x2="180" y2="55" stroke="#2f6fed" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="180" cy="55" r="10" fill="#fff" stroke="#2f6fed" strokeWidth="2" />
        <text x="180" y="59" fontSize="10" textAnchor="middle">🚑</text>
      </svg>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
        Live incident + resource map preview
      </p>
    </div>
  )
}

export default Home
