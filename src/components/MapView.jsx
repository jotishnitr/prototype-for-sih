import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

const severityColor = {
  Critical: '#e13c3c',
  High: '#f2872e',
  Medium: '#f0c419',
  Low: '#2fa860'
}

const resourceEmoji = {
  'Rescue Team': '👨‍🚒',
  'Ambulance': '🚑',
  'Rescue Boat': '🚤',
  'Relief Supply': '📦',
  'Shelter': '🏠'
}

// Build a small colored circle icon for an incident marker
function incidentIcon(severity, selected) {
  const color = severityColor[severity] || '#5c6b7a'
  const size = selected ? 26 : 20
  return L.divIcon({
    className: 'incident-marker',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 0 0 2px ${color}55;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

// Build an emoji icon for a resource marker
function resourceIcon(type) {
  return L.divIcon({
    className: 'resource-marker',
    html: `<div style="
      width:30px;height:30px;border-radius:50%;
      background:#fff;border:2px solid var(--navy);
      display:flex;align-items:center;justify-content:center;
      font-size:15px;
    ">${resourceEmoji[type] || '📍'}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

// Simple shelter icon
function shelterIcon() {
  return L.divIcon({
    className: 'shelter-marker',
    html: `<div style="
      width:28px;height:28px;border-radius:6px;
      background:#fff;border:2px solid var(--green);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
    ">🏠</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

// Keeps the map centered when the selected incident changes
function RecenterOnSelect({ incident }) {
  const map = useMap()
  useEffect(() => {
    if (incident) {
      map.flyTo([incident.lat, incident.lng], Math.max(map.getZoom(), 13), { duration: 0.6 })
    }
  }, [incident, map])
  return null
}

function MapView({
  incidents,
  resources,
  shelters,
  viewMode,
  selectedIncident,
  onSelectIncident,
  assignedLine,
  center
}) {
  const showIncidents = viewMode === 'reports' || viewMode === 'heatmap'
  const showResources = viewMode === 'resources'

  return (
    <MapContainer center={center} zoom={12} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterOnSelect incident={selectedIncident} />

      {/* Heatmap mode - simple concentration circles, not a real GIS heatmap */}
      {viewMode === 'heatmap' &&
        incidents.map((inc) => (
          <Circle
            key={`heat-${inc.id}`}
            center={[inc.lat, inc.lng]}
            radius={inc.severity === 'Critical' ? 900 : inc.severity === 'High' ? 650 : 400}
            pathOptions={{
              color: severityColor[inc.severity],
              fillColor: severityColor[inc.severity],
              fillOpacity: 0.25,
              weight: 0
            }}
          />
        ))}

      {showIncidents &&
        incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.lat, inc.lng]}
            icon={incidentIcon(inc.severity, selectedIncident && selectedIncident.id === inc.id)}
            eventHandlers={{ click: () => onSelectIncident(inc) }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                <p style={{ fontWeight: 800, marginBottom: 4 }}>{inc.id}</p>
                <p style={{ marginBottom: 2 }}>{inc.type}</p>
                <p style={{ marginBottom: 4, fontWeight: 700, color: severityColor[inc.severity] }}>
                  {inc.severity.toUpperCase()}
                </p>
                <p style={{ fontSize: 12, marginBottom: 4 }}>{inc.description}</p>
                <p style={{ fontSize: 12, color: '#5c6b7a' }}>Reported: {inc.reportedTime}</p>
                <p style={{ fontSize: 12, color: '#5c6b7a' }}>Status: {inc.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      {showResources &&
        resources.map((res) => (
          <Marker key={res.id} position={[res.lat, res.lng]} icon={resourceIcon(res.type)}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                <p style={{ fontWeight: 800, marginBottom: 4 }}>{res.id}</p>
                <p style={{ marginBottom: 2 }}>{res.type}</p>
                <p style={{ fontSize: 12, marginBottom: 4 }}>Capacity: {res.capacity}</p>
                <p style={{ fontSize: 12, color: '#5c6b7a' }}>Status: {res.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      {showResources &&
        shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon()}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                <p style={{ fontWeight: 800, marginBottom: 4 }}>{s.name}</p>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  {s.occupied} / {s.capacity} occupied
                </p>
                <p style={{ fontSize: 12, color: '#5c6b7a' }}>Status: {s.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      {assignedLine && (
        <Polyline
          positions={[
            [assignedLine.from.lat, assignedLine.from.lng],
            [assignedLine.to.lat, assignedLine.to.lng]
          ]}
          pathOptions={{ color: '#2f6fed', weight: 3, dashArray: '6 6' }}
        />
      )}
    </MapContainer>
  )
}

export default MapView
