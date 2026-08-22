import { useState } from 'react'
import MapView from '../components/MapView.jsx'
import StatsCard from '../components/StatsCard.jsx'
import IncidentCard from '../components/IncidentCard.jsx'
import ResourceCard from '../components/ResourceCard.jsx'
import AlertCard from '../components/AlertCard.jsx'
import ActivityFeed from '../components/ActivityFeed.jsx'
import {
  incidents as initialIncidents,
  resources as initialResources,
  shelters,
  supplies,
  weatherAlert,
  activityFeedSeed,
  getDistanceKm,
  suitableResourceMap
} from '../data/mockData.js'

const MAP_CENTER = [20.2975, 85.8290]

function Dashboard() {
  const [incidents, setIncidents] = useState(initialIncidents)
  const [resources, setResources] = useState(initialResources)
  const [activity, setActivity] = useState(activityFeedSeed)
  const [selectedId, setSelectedId] = useState(null)
  const [viewMode, setViewMode] = useState('reports')
  const [assignedLine, setAssignedLine] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [smsMessage, setSmsMessage] = useState(null)
  const [nextIncidentNum, setNextIncidentNum] = useState(1048)

  const selectedIncident = incidents.find((i) => i.id === selectedId) || null

  const activeCount = incidents.filter((i) => i.status !== 'Resolved').length
  const criticalCount = incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length
  const availableTeams = resources.filter((r) => r.type === 'Rescue Team' && r.status === 'Available').length
  const availableShelters = shelters.filter((s) => s.status === 'Available').length

  // find the 3 closest available resources to the selected incident
  // just recalculating this every render, the data is small so it's fine
  let nearestResources = []
  if (selectedIncident) {
    const availableOnes = resources.filter((r) => r.status === 'Available')
    const withDistance = []
    for (let i = 0; i < availableOnes.length; i++) {
      const r = availableOnes[i]
      const dist = getDistanceKm(selectedIncident.lat, selectedIncident.lng, r.lat, r.lng)
      withDistance.push({ ...r, distance: dist })
    }
    withDistance.sort((a, b) => a.distance - b.distance)
    nearestResources = withDistance.slice(0, 3)
  }

  function selectIncident(inc) {
    setSelectedId(inc.id)
    setRecommendation(null)
  }

  // this is the "auto find nearest resource" button logic
  function findNearestSuitable() {
    if (!selectedIncident) return

    // get list of resource types that make sense for this incident type
    const suitableTypes = suitableResourceMap[selectedIncident.type] || []

    // step 1: only keep resources that are available AND the right type
    let candidates = []
    for (let i = 0; i < resources.length; i++) {
      const r = resources[i]
      if (r.status === 'Available' && suitableTypes.includes(r.type)) {
        candidates.push({ ...r })
      }
    }

    // step 2: work out distance for each one
    for (let i = 0; i < candidates.length; i++) {
      candidates[i].distance = getDistanceKm(selectedIncident.lat, selectedIncident.lng, candidates[i].lat, candidates[i].lng)
    }

    // step 3: sort so the closest one is first
    candidates.sort((a, b) => a.distance - b.distance)

    if (candidates.length === 0) {
      setRecommendation({ none: true })
    } else {
      setRecommendation(candidates[0])
    }
  }

  function assignResource(resource) {
    if (!selectedIncident) return

    setIncidents((prev) =>
      prev.map((i) => (i.id === selectedIncident.id ? { ...i, status: 'Assigned' } : i))
    )
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, status: 'Deployed' } : r))
    )
    setAssignedLine({
      from: { lat: selectedIncident.lat, lng: selectedIncident.lng },
      to: { lat: resource.lat, lng: resource.lng }
    })
    setActivity((prev) => [
      { id: Date.now(), text: `${resource.id} assigned to ${selectedIncident.id}`, type: 'assign' },
      ...prev
    ])
    setRecommendation(null)
  }

  function simulateSms() {
    const id = `INC-1${nextIncidentNum}`
    setNextIncidentNum((n) => n + 1)
    const newIncident = {
      id,
      type: 'Flood',
      severity: 'Critical',
      lat: 22.26,
      lng: 84.85,
      status: 'Unassigned',
      description: 'Reported via SMS: FLOOD CRITICAL 22.26 84.85',
      reportedTime: 'just now',
      sector: 'Unmapped Sector'
    }
    setIncidents((prev) => [newIncident, ...prev])
    setActivity((prev) => [{ id: Date.now(), text: `SMS report converted to ${id}`, type: 'sms' }, ...prev])
    setSmsMessage(newIncident)
  }

  return (
    <main style={{ background: 'var(--bg)' }}>
      {/* Page header, same style as the rest of the site */}
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
          <StatsCard label="Active Incidents" value={activeCount} accent="var(--navy)" />
          <StatsCard label="Critical Incidents" value={criticalCount} accent="var(--red)" />
          <StatsCard label="Available Teams" value={availableTeams} accent="var(--green)" />
          <StatsCard label="Available Shelters" value={availableShelters} accent="var(--blue)" />
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
              shelters={shelters}
              viewMode={viewMode}
              selectedIncident={selectedIncident}
              onSelectIncident={selectIncident}
              assignedLine={assignedLine}
              center={MAP_CENTER}
            />
          </div>

          {/* Story strip - makes the flow obvious at a glance */}
          <div className="card" style={{ marginTop: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            <span>🔴 Incident</span>
            <span>→</span>
            <span>System finds nearest resource</span>
            <span>→</span>
            <span>🚑 Resource</span>
            <span>→</span>
            <span>Assign</span>
            <span>→</span>
            <span style={{ color: 'var(--green)' }}>🟢 Response started</span>
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

          {/* SMS fallback */}
          <div className="card" style={{ marginTop: 14, padding: 18 }}>
            <h3 style={panelTitle}>LOW CONNECTIVITY MODE</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Receive emergency reports through SMS when internet connectivity is unavailable.
            </p>
            <button className="btn btn-outline btn-small" onClick={simulateSms}>
              Simulate Incoming SMS
            </button>

            {smsMessage && (
              <div style={{ marginTop: 14, background: 'var(--blue-bg)', borderRadius: 8, padding: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>SMS REPORT RECEIVED</p>
                <p style={{ fontSize: 13, marginBottom: 4 }}>Location detected: {smsMessage.lat}, {smsMessage.lng}</p>
                <p style={{ fontSize: 13, marginBottom: 4 }}>Severity: {smsMessage.severity}</p>
                <p style={{ fontSize: 13 }}>Status: {smsMessage.status}</p>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedIncident ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={panelTitle}>INCIDENT DETAILS</h3>
              <IncidentCard incident={selectedIncident} />

              {selectedIncident.status !== 'Assigned' && (
                <>
                  <button className="btn btn-secondary btn-full" onClick={findNearestSuitable}>
                    Auto Find Nearest Resource
                  </button>

                  {recommendation && !recommendation.none && (
                    <div className="card" style={{ padding: 14, background: 'var(--green-bg)', border: '1px solid var(--green)' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>
                        RECOMMENDED RESOURCE
                      </p>
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>
                        {resourceEmojiFor(recommendation.type)} {recommendation.id}
                      </p>
                      <p style={{ fontSize: 13, marginBottom: 4 }}>Distance: {recommendation.distance.toFixed(1)} km</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                        Reason: Nearest available resource suitable for this incident.
                      </p>
                      <button className="btn btn-primary btn-small btn-full" onClick={() => assignResource(recommendation)}>
                        Assign Resource
                      </button>
                    </div>
                  )}

                  {recommendation && recommendation.none && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      No suitable available resource found nearby.
                    </p>
                  )}

                  <h3 style={panelTitle}>RECOMMENDED RESOURCES</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {nearestResources.map((r) => (
                      <ResourceCard key={r.id} resource={r} distance={r.distance} onAssign={assignResource} />
                    ))}
                    {nearestResources.length === 0 && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No available resources nearby.</p>
                    )}
                  </div>
                </>
              )}

              {selectedIncident.status === 'Assigned' && (
                <div className="card" style={{ padding: 14, background: 'var(--blue-bg)' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>Response in progress</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    A resource has been deployed for this incident.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Click any incident marker on the map to view details and assign a resource.
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

function resourceEmojiFor(type) {
  const map = {
    'Rescue Team': '👨‍🚒',
    'Ambulance': '🚑',
    'Rescue Boat': '🚤',
    'Relief Supply': '📦'
  }
  return map[type] || '📍'
}

export default Dashboard
