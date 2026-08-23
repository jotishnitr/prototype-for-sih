import { useState, useEffect } from 'react'
import MapView from '../components/MapView.jsx'
import StatsCard from '../components/StatsCard.jsx'
import IncidentCard from '../components/IncidentCard.jsx'
import AlertCard from '../components/AlertCard.jsx'
import ActivityFeed from '../components/ActivityFeed.jsx'
import {
  resources as initialResources,
  shelters,
  supplies,
  weatherAlert,
  activityFeedSeed
} from '../data/mockData.js'

const MAP_CENTER = [20.2975, 85.8290]

function Dashboard() {

  const [incidents, setIncidents] = useState(null)
  const [resources, setResources] = useState(initialResources)
  const [activity, setActivity] = useState(activityFeedSeed)
  const [selectedId, setSelectedId] = useState(null)
  const [viewMode, setViewMode] = useState('reports')

  const selectedIncident = Array.isArray(incidents)
    ? incidents.find((i) => i.id === selectedId || i._id === selectedId)
    : null

  const [activeCount, setActiveCount] = useState(0)
  const [unitsDispatched, setUnitsDispatched] = useState(0)
  const [totalUnits, setTotalUnits] = useState(0)
  const [shelterCapacity, setShelterCapacity] = useState(0)
  const [estResponse, setEstResponse] = useState(0)

  useEffect(() => {
    async function getStats() {
      try {
        const response = await fetch("https://resqnet-fmhd.onrender.com/api/getStats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (response.ok) {
          const data = await response.json()
          setActiveCount(data.activeIncidents ?? 0)
          setUnitsDispatched(data.unitsDispatched ?? 0)
          setTotalUnits(data.resources?.length || 0)
          setShelterCapacity(data.shelterCapacity ?? 0)
          setEstResponse(data.estResponse ?? 0)
        }
      } catch (err) {
        console.warn("Could not load live stats from server:", err)
      }
    }
    getStats()
  }, [])

  useEffect(() => {
    async function getIncidents() {
      try {
        const response = await fetch("https://resqnet-fmhd.onrender.com/api/getIncidentsDetails", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
        })
        if (response.ok) {
          const data = await response.json()
          const list = data.incidents || (Array.isArray(data) ? data : null)
          if (list) {
            setIncidents(list)
          }
        }
      } catch (err) {
        console.warn("Could not load live incidents from server:", err)
      }
    }
    getIncidents()
  }, [])

  useEffect(() => {
    async function getResources() {
      try {
        const response = await fetch("https://resqnet-fmhd.onrender.com/api/getResources", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (response.ok) {
          const data = await response.json()
          const list = data.resources || (Array.isArray(data) ? data : null)
          if (list) {
            setResources(list)
          }
        }
      } catch (err) {
        console.warn("Could not load live resources from server:", err)
      }
    }
    getResources()
  }, [])

  function selectIncident(inc) {
    setSelectedId(inc.id || inc._id)
  }

  return (
    <main style={{ background: 'var(--bg)' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22 }}>Authority Control Center</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sector-wide incident and resource overview</p>
          </div>
          <span className="chip chip-low">🟢 System Operational</span>
        </div>
      </div>

      {/* Stats */}
      <div className="container" style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatsCard label="Active Incidents" value={activeCount} accent="var(--red)" />
          <StatsCard label="Units Dispatched" value={`${unitsDispatched}/${totalUnits}`} accent="var(--blue)" />
          <StatsCard label="Shelter Occupancy" value={shelterCapacity} accent="var(--orange)" />
          <StatsCard label="Est. Response" value={estResponse} accent="var(--green)" />
        </div>
      </div>

      {/* Main grid: map + side panel */}
      <div className="container dash-grid" style={{ padding: '20px 24px 40px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Map column */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {['reports', 'resources', 'heatmap'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="btn btn-small"
                style={{
                  background: viewMode === mode ? 'var(--navy)' : '#fff',
                  color: viewMode === mode ? '#fff' : 'var(--text-main)',
                  border: '1px solid var(--border)'
                }}
              >
                {mode === 'reports' ? 'Reports' : mode === 'resources' ? 'Resources' : 'Heatmap'}
              </button>
            ))}
          </div>

          <div className="card" style={{ height: 520, overflow: 'hidden' }}>
            <MapView
              incidents={incidents}
              resources={resources}
              selectedIncident={selectedIncident}
              viewMode={viewMode}
              onSelectIncident={selectIncident}
              center={MAP_CENTER}
            />
          </div>

          {/* Shelters & supplies */}
          <div className="card" style={{ marginTop: 14, padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} id="shelter-grid">
              <div>
                <h3 style={panelTitle}>SHELTERS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {shelters.map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <div>
                        <p style={{ fontWeight: 600 }}>{s.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {s.occupied} / {s.capacity} occupied
                        </p>
                      </div>
                      <span className={`chip ${s.status === 'Available' ? 'chip-low' : 'chip-critical'}`}>
                        {s.status === 'Available' ? '🟢' : '🔴'} {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={panelTitle}>RELIEF SUPPLIES</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {supplies.map((sup) => (
                    <div key={sup.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span>{sup.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{sup.percent}%</span>
                      </div>
                      <div style={{ background: '#eef1f4', borderRadius: 6, height: 8 }}>
                        <div
                          style={{
                            width: `${sup.percent}%`,
                            background: sup.percent < 40 ? 'var(--red)' : sup.percent < 70 ? 'var(--orange)' : 'var(--green)',
                            height: '100%',
                            borderRadius: 6
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedIncident ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={panelTitle}>INCIDENT DETAILS</h3>
              <IncidentCard incident={selectedIncident} />

              {selectedIncident.status === 'Assigned' || selectedIncident.status === 'allocated' ? (
                <div className="card" style={{ padding: 14, background: 'var(--blue-bg)' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>Response in progress</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    A resource has been deployed for this incident.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="card" style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Click any incident marker on the map to view details.
              </p>
            </div>
          )}

          <AlertCard alert={weatherAlert} />
          <ActivityFeed items={activity} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-grid {
            grid-template-columns: 1fr !important;
          }
          #shelter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}

const panelTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.02em'
}

export default Dashboard
