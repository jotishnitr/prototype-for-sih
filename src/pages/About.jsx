import About from './pages/About.jsx'

<Route path="/about" element={<About />} />
function About() {
  return (
    <main className="container" style={{ maxWidth: 800, padding: '56px 24px 64px' }}>
      <span className="chip chip-info" style={{ marginBottom: 14 }}>
        ABOUT RESQGRID
      </span>
      <h1 style={{ fontSize: 30, marginBottom: 10 }}>Built for PS-05</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
        ResQGrid is a hackathon prototype for PS-05: Real-Time Disaster Early-Warning
        &amp; Resource Coordination Platform. It connects citizen incident reports with
        a live map so authorities can find and assign the nearest available resource,
        fast.
      </p>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, marginBottom: 8 }}>The Problem</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          During a disaster, incident reports and available emergency resources
          usually live in different places. That gap costs time. ResQGrid puts
          reports, teams, ambulances, boats, and shelters on one live map, so
          nothing gets lost between "someone needs help" and "help is on the way."
        </p>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, marginBottom: 14 }}>How It Works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Step number="1" text="A citizen reports an incident with location, type, severity and a short description." />
          <Step number="2" text="It shows up instantly on the authority dashboard map, color-coded by severity." />
          <Step number="3" text="The authority clicks the incident and hits Auto Find Nearest Resource." />
          <Step number="4" text="The nearest available, suitable team is recommended and assigned in one click." />
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, marginBottom: 12 }}>Built With</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['React', 'React Router', 'Leaflet + OpenStreetMap', 'Plain CSS'].map((t) => (
            <span key={t} className="chip chip-neutral">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 22, borderLeft: '4px solid var(--orange)' }}>
        <h2 style={{ fontSize: 15, marginBottom: 8, color: 'var(--orange)' }}>Prototype Note</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          All incident, resource and weather data shown is mock data for this demo.
          The code is structured so a real backend, SMS gateway and live weather/IMD
          API can be plugged in later without changing the frontend much.
        </p>
      </div>
    </main>
  )
}

function Step({ number, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'var(--navy)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {number}
      </span>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, paddingTop: 3 }}>{text}</p>
    </div>
  )
}

export default About
