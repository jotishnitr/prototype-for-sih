function About() {
  return (
    <main className="container" style={{ maxWidth: 960, padding: '48px 24px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span className="chip chip-info" style={{ marginBottom: 12 }}>
          PS-05 DISASTER MANAGEMENT PLATFORM
        </span>
        <h1 style={{ fontSize: 34, color: 'var(--navy)', marginBottom: 12, fontWeight: 800 }}>
          About ResQNet
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 720, margin: '0 auto', lineHeight: 1.6 }}>
          ResQNet is an end-to-end, real-time disaster early-warning and autonomous resource coordination system. 
          It bridges citizen emergency reports with disaster response authorities via live geospatial mapping, 
          AI-driven severity prediction, automated resource dispatch, and instant SMS alerts.
        </p>
      </div>

      {/* Grid of Key System Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 24, borderTop: '4px solid var(--red)' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🚨</div>
          <h3 style={{ fontSize: 17, marginBottom: 8, color: 'var(--navy)' }}>Citizen Incident Reporting</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Enables instant reporting with exact GPS coordinates, photos, incident type (Flood, Fire, Building Collapse, Medical), and descriptions. Automatically assigned to local jurisdictions.
          </p>
        </div>

        <div className="card" style={{ padding: 24, borderTop: '4px solid var(--blue)' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🤖</div>
          <h3 style={{ fontSize: 17, marginBottom: 8, color: 'var(--navy)' }}>AI Demand &amp; Severity Model</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Utilizes built-in predictive algorithms (<code style={{ background: '#edf2f7', padding: '2px 5px', borderRadius: 4, fontSize: 12 }}>severityPrediction</code> &amp; <code style={{ background: '#edf2f7', padding: '2px 5px', borderRadius: 4, fontSize: 12 }}>resourcePrediction</code>) to forecast required personnel, food packets, water, and medical kits based on disaster intensity.
          </p>
        </div>

        <div className="card" style={{ padding: 24, borderTop: '4px solid var(--green)' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
          <h3 style={{ fontSize: 17, marginBottom: 8, color: 'var(--navy)' }}>Spatial Auto-Allocation</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Calculates geospatial distances using MongoDB 2DSphere indexes &amp; Haversine logic to match and auto-dispatch the closest eligible rescue team, medical unit, or shelter in 1 click.
          </p>
        </div>
      </div>

      {/* Backend & Infrastructure Deep Dive */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚙️</span> Backend Architecture &amp; Live Systems
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
          <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: 15, marginBottom: 8, color: 'var(--navy)' }}>🗄️ MongoDB Geospatial Database</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Production MongoDB Atlas cluster using custom schemas for <strong>Incidents</strong>, <strong>Resources</strong>, <strong>Allocations</strong>, <strong>Jurisdictions</strong>, <strong>Alerts</strong>, and <strong>Users</strong>. Employs <code>2dsphere</code> spatial indexes for instant location lookups.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: 15, marginBottom: 8, color: 'var(--navy)' }}>📡 Real-Time WebSockets (Socket.io)</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Bidirectional WebSocket connection pushes live incident creations, status modifications, auto-allocations, and emergency broadcast alerts instantly across all active commander dashboards without page reloads.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: 15, marginBottom: 8, color: 'var(--navy)' }}>📲 SMS Dispatch &amp; Emergency Alerting</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Integrated SMS broadcast service (<code>sendSms.js</code>) sends immediate text alerts to field team leads and emergency contacts when high-severity incidents occur or new units are deployed.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: 15, marginBottom: 8, color: 'var(--navy)' }}>🌩️ Weather Early Warning Engine</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Automated weather monitoring module (<code>getWeather.js</code>) fetches live meteorological conditions and disaster alerts to notify authorities of incoming severe weather events.
            </p>
          </div>
        </div>
      </div>

      {/* How Workflow Operates */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, marginBottom: 18, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🔄</span> End-to-End Incident Response Workflow
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Step number="1" title="Citizen Report Submission" text="Citizens log emergency incidents with GPS location, photo attachment, and category details via the public reporting portal." />
          <Step number="2" title="AI Severity & Resource Demand Assessment" text="The backend runs predictive analysis to grade severity (Critical, High, Medium, Low) and calculate required rescue personnel, medical beds, or food/water supplies." />
          <Step number="3" title="Live Geospatial Map & Heatmap Sync" text="The report streams via WebSockets to the jurisdiction dashboard, displaying interactive Leaflet markers and continuous density heatmaps." />
          <Step number="4" title="Automated Nearest-Resource Match" text="Authorities initiate 1-click auto-allocation. The algorithm queries 2DSphere spatial coordinates, identifies the closest available resource, assigns it, and updates shelter/team readiness." />
          <Step number="5" title="SMS Alert & Field Notification" text="Automated SMS notifications are dispatched to field commanders with incident directions and victim details." />
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>💻</span> Technology Stack
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Frontend</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['React 19', 'Vite', 'React Router v7', 'Leaflet', 'React-Leaflet', 'Leaflet.heat', 'Socket.io Client'].map(t => (
                <span key={t} className="chip chip-info" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Backend &amp; APIs</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Node.js', 'Express.js', 'Socket.io Server', 'JWT Auth', 'SMS API', 'Axios'].map(t => (
                <span key={t} className="chip chip-low" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Database &amp; AI</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['MongoDB Atlas', 'Mongoose ODM', '2DSphere Indexing', 'Gemini AI API', 'Severity Model'].map(t => (
                <span key={t} className="chip chip-high" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Deployment</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Vercel (Frontend)', 'Render (Backend API)', 'Git Version Control'].map(t => (
                <span key={t} className="chip chip-neutral" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Production System Note */}
      <div className="card" style={{ padding: 22, borderLeft: '4px solid var(--green)', background: 'var(--green-bg)' }}>
        <h2 style={{ fontSize: 15, marginBottom: 8, color: 'var(--green)' }}>Live Production System</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-main)', lineHeight: 1.6 }}>
          ResQNet operates with a live Node.js REST API and WebSocket gateway hosted on Render, connected to a production MongoDB database. 
          All auto-allocation calculations, shelter occupancy percentages, emergency alerts, and live map markers reflect live database state and real-time backend updates.
        </p>
      </div>
    </main>
  )
}

function Step({ number, title, text }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--navy)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2
        }}
      >
        {number}
      </span>
      <div>
        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>{title}</h4>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</p>
      </div>
    </div>
  )
}

export default About
