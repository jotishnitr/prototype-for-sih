import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [weatherAlert, setWeatherAlert] = useState(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch("https://resqnet-fmhd.onrender.com/api/getWeather", {
          method: "GET",
          credentials: "include"
        })
        if (response.ok) {
          const data = await response.json()
          if (data.weatherAlert) {
            setWeatherAlert(data.weatherAlert)
          }
        }
      } catch (err) {
        console.warn("Could not load live weather:", err)
      }
    }
    fetchWeather()
  }, [])

  return (
    <main>
      {/* Weather Early Warning Ticker */}
      <div style={{ background: 'var(--navy-dark)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 0', color: '#fff', fontSize: '13px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="chip chip-critical" style={{ fontSize: '10px', padding: '2px 8px' }}>⚡ EARLY WARNING BANNER</span>
            <span style={{ fontWeight: 600, color: '#fef1e6' }}>
              {typeof weatherAlert === 'string'
                ? weatherAlert
                : (weatherAlert?.title
                    ? `${weatherAlert.title}${weatherAlert.area ? ` (${weatherAlert.area})` : ''}${weatherAlert.severity ? ` - ${weatherAlert.severity}` : ''}`
                    : 'IMD Weather Warning: Active Monitoring Enabled for Coastal & Flood-prone Districts')}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2fa860', display: 'inline-block' }}></span>
            Render Backend Live &amp; WebSocket Connected
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ background: 'var(--navy)', color: '#fff', padding: '64px 0 72px' }}>
        <div className="container hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }}>
          <div>
            <span className="chip chip-info" style={{ marginBottom: 18, display: 'inline-flex' }}>
              PS-05 DISASTER EARLY-WARNING &amp; RESOURCE PLATFORM
            </span>
            <h1 style={{ fontSize: 42, lineHeight: 1.15, marginBottom: 18, fontWeight: 800 }}>
              Real-Time Disaster Response, Connected.
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 30, maxWidth: 500 }}>
              ResQNet unifies citizen emergency reporting, AI severity prediction, 2DSphere spatial auto-allocation, and SMS dispatch on a live interactive command dashboard.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/report" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
                🚨 Report an Incident
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff', padding: '12px 24px', fontSize: 15 }}>
                📊 Open Authority Dashboard
              </Link>
            </div>
          </div>

          <MiniMapGraphic />
        </div>
      </section>

      {/* System Features Grid */}
      <section style={{ padding: '56px 0 32px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, color: 'var(--navy)', marginBottom: 8, fontWeight: 800 }}>
              End-to-End Emergency Coordination Features
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 640, margin: '0 auto' }}>
              Engineered with full-stack MongoDB geospatial indexing, Socket.io WebSockets, AI prediction models, and SMS alert dispatch.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }} id="feature-grid">
            <FeatureCard
              icon="📍"
              title="Live Geospatial & Heatmap Tracking"
              desc="Interactive Leaflet mapping with severity-coded pins and continuous kernel density heatmaps for real-time situational awareness."
              color="var(--red)"
            />
            <FeatureCard
              icon="⚡"
              title="2DSphere Spatial Auto-Allocation"
              desc="Haversine distance algorithms automatically calculate spatial proximity to dispatch the nearest rescue team, ambulance, or shelter in 1 click."
              color="var(--blue)"
            />
            <FeatureCard
              icon="🤖"
              title="AI Demand & Severity Prediction"
              desc="Intelligent algorithms analyze report text to grade severity levels and forecast exact resource requirements (food, water, beds, medical kits)."
              color="var(--orange)"
            />
            <FeatureCard
              icon="📲"
              title="Emergency SMS & Alert Broadcast"
              desc="Low-latency SMS emergency dispatch transmits urgent incident updates directly to field commander phones and citizen contact numbers."
              color="var(--green)"
            />
          </div>
        </div>
      </section>

      {/* Architecture & Stats Overview */}
      <section id="about" style={{ padding: '24px 0 64px' }}>
        <div className="container card" style={{ padding: 32, background: '#ffffff', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }} className="overview-grid">
            <div>
              <span className="chip chip-info" style={{ marginBottom: 12 }}>SYSTEM OVERVIEW</span>
              <h2 style={{ fontSize: 22, marginBottom: 10, color: 'var(--navy)', fontWeight: 700 }}>About ResQNet Platform</h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
                Built for PS-05, ResQNet operates on a Node.js REST API with Socket.io WebSockets on Render, backed by a production MongoDB Atlas database with 2DSphere spatial indexing.
              </p>
              <Link to="/about" style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                View Full Technology Stack &amp; Features &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 32, borderLeft: '1px solid var(--border)', paddingLeft: 32 }} className="stats-border">
              <Stat label="Avg Response Time" value="< 5 min" color="var(--green)" />
              <Stat label="Geospatial Indexing" value="2DSphere" color="var(--blue)" />
              <Stat label="Live Dispatch" value="WebSockets" color="var(--orange)" />
              <Stat label="Problem Statement" value="PS-05" color="var(--navy)" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0a1f3d",
          color: "rgba(255,255,255,0.7)",
          padding: "50px 0 25px",
          fontSize: 14,
          marginTop: 40,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 40,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: 40,
              marginBottom: 25,
            }}
          >
            {/* Brand Info */}
            <div style={{ maxWidth: 320 }}>
              <strong
                style={{
                  color: "#fff",
                  fontSize: 20,
                  display: "block",
                  marginBottom: 15,
                  letterSpacing: 0.5,
                }}
              >
                ResQNet
              </strong>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                A centralized platform for disaster management, connecting citizens with emergency responders for rapid, organized action.
              </p>
            </div>

            {/* Navigation Links */}
            <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
              <div>
                <strong
                  style={{
                    color: "#fff",
                    display: "block",
                    marginBottom: 15,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Platform
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/report" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Report Incident
                  </Link>
                  <Link to="/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Live Dashboard
                  </Link>
                  <Link to="/about" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    About Us
                  </Link>
                </div>
              </div>

              <div>
                <strong
                  style={{
                    color: "#fff",
                    display: "block",
                    marginBottom: 15,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Legal
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/about" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Privacy Policy
                  </Link>
                  <Link to="/about" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Terms of Service
                  </Link>
                  <a href="mailto:support@resqnet.example" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Area */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 15,
              fontSize: 12.5,
            }}
          >
            <span>&copy; {new Date().getFullYear()} ResQNet. All rights reserved. Made by Team Altiora</span>
            <span>PS-05 · Disaster Management</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .overview-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-border {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--border) !important;
            padding-top: 20px !important;
            flex-wrap: wrap !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </main>
  )
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p style={{ fontSize: 20, fontWeight: 800, color: color || 'var(--navy)', marginBottom: 2 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="card" style={{ padding: 24, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16.5, marginBottom: 8, color: 'var(--navy)', fontWeight: 700 }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>{desc}</p>
    </div>
  )
}

function MiniMapGraphic() {
  return (
    <div style={{ background: '#0f2f57', borderRadius: 12, padding: 18, border: '1px solid rgba(255,255,255,0.15)', boxShadow: 'var(--shadow-md)' }}>
      <svg viewBox="0 0 400 280" width="100%" height="auto">
        <rect x="0" y="0" width="400" height="280" rx="8" fill="#0d2a4f" />
        {/* Grid lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 35} x2="400" y2={i * 35} stroke="#1c3f6b" strokeWidth="1" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 35} y1="0" x2={i * 35} y2="280" stroke="#1c3f6b" strokeWidth="1" />
        ))}
        {/* Road path */}
        <path d="M20,220 C120,180 180,240 260,160 S360,100 390,60" stroke="#3a5a82" strokeWidth="6" fill="none" />

        {/* Incident markers */}
        <circle cx="120" cy="90" r="8" fill="#e13c3c" stroke="#fff" strokeWidth="2" />
        <circle cx="230" cy="150" r="7" fill="#f2872e" stroke="#fff" strokeWidth="2" />
        <circle cx="300" cy="80" r="6" fill="#f0c419" stroke="#fff" strokeWidth="2" />
        <circle cx="90" cy="190" r="6" fill="#2fa860" stroke="#fff" strokeWidth="2" />

        {/* Dispatch connection */}
        <line x1="120" y1="90" x2="180" y2="55" stroke="#2f6fed" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="180" cy="55" r="10" fill="#fff" stroke="#2f6fed" strokeWidth="2" />
        <text x="180" y="59" fontSize="10" textAnchor="middle">🚑</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
        <span>📍 Rourkela Command Sector</span>
        <span style={{ color: '#2fa860', fontWeight: 700 }}>● 2DSphere Live Match</span>
      </div>
    </div>
  )
}

export default Home
