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
  'rescue_team': '👨‍🚒',
  'rescue team': '👨‍🚒',
  'Ambulance': '🚑',
  'ambulance': '🚑',
  'medical_unit': '🏥',
  'medical unit': '🏥',
  'Rescue Boat': '🚤',
  'rescue_boat': '🚤',
  'Relief Supply': '📦',
  'relief_supply': '📦',
  'supply_depot': '📦',
  'Shelter': '🏠',
  'shelter': '🏠'
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

// Keeps the map centered when the selected incident or resource changes
function RecenterOnSelect({ incident, resource }) {
  const map = useMap()
  useEffect(() => {
    if (incident) {
      const lat = incident.lat ?? incident.location?.coordinates?.[1]
      const lng = incident.lng ?? incident.location?.coordinates?.[0]
      if (lat != null && lng != null) {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 0.6 })
      }
    } else if (resource) {
      const lat = resource.lat ?? resource.location?.coordinates?.[1]
      const lng = resource.lng ?? resource.location?.coordinates?.[0]
      if (lat != null && lng != null) {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 0.6 })
      }
    }
  }, [incident, resource, map])
  return null
}

function FitMapBounds({ incidents, resources, selectedIncident }) {
  const map = useMap()
  useEffect(() => {
    if (selectedIncident) return

    const points = []
    
    const incList = Array.isArray(incidents) ? incidents : (incidents?.incidents || [])
    const resList = Array.isArray(resources) ? resources : (resources?.resources || [])

    incList.forEach(inc => {
      const lat = inc.lat ?? inc.location?.coordinates?.[1]
      const lng = inc.lng ?? inc.location?.coordinates?.[0]
      if (lat != null && lng != null) {
        points.push([lat, lng])
      }
    })

    resList.forEach(res => {
      const lat = res.lat ?? res.location?.coordinates?.[1]
      const lng = res.lng ?? res.location?.coordinates?.[0]
      if (lat != null && lng != null) {
        points.push([lat, lng])
      }
    })

    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
    }
  }, [incidents, resources, selectedIncident, map])
  return null
}

function renderResourcePopupContent(res, incName) {
  const id = res.name || res.id || (res._id ? `RES-${String(res._id).slice(-4).toUpperCase()}` : 'RES')
  const typeLabel = res.type 
    ? res.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) 
    : 'Resource'
  const status = res.status || 'Available'
  
  // Capacity/readiness
  let capacityInfo = null
  if (res.type === 'shelter' && res.shelter) {
    capacityInfo = `Capacity: ${res.shelter.capacity_remaining} / ${res.shelter.capacity_total} vacant`
  } else if (res.type === 'rescue_team' && res.rescue_team) {
    capacityInfo = `Members: ${res.rescue_team.available_members} / ${res.rescue_team.total_members} ready`
  } else if (res.type === 'medical_unit' && res.medical_unit) {
    capacityInfo = `Ambulances: ${res.medical_unit.available_ambulances} | Beds: ${res.medical_unit.available_beds}`
  } else if (res.type === 'supply_depot' && res.supply_depot) {
    capacityInfo = `Food: ${res.supply_depot.available_food_packets} | Water: ${res.supply_depot.available_water_litres}L`
  }

  const address = res.location?.address || res.address
  const phone = res.location?.contact_phone || res.contact_phone

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160, fontSize: '12px', lineHeight: '1.4' }}>
      <p style={{ fontWeight: 800, fontSize: '13px', margin: '0 0 4px 0', color: 'var(--navy)' }}>🔵 {id}</p>
      <p style={{ margin: '0 0 2px 0', color: 'var(--text-muted)' }}>Type: {typeLabel}</p>
      <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Status: {status}</p>
      
      {capacityInfo && (
        <p style={{ margin: '4px 0', background: 'var(--bg)', padding: '4px 6px', borderRadius: 4 }}>
          📈 {capacityInfo}
        </p>
      )}
      {address && <p style={{ margin: '2px 0', color: '#5c6b7a' }}>📍 {address}</p>}
      {phone && <p style={{ margin: '2px 0', color: '#5c6b7a' }}>📞 {phone}</p>}
      
      {incName && (
        <p style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 700, marginTop: '6px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
          Assigned to {incName}
        </p>
      )}
    </div>
  )
}

function MapView({
  incidents = [],
  resources = [],
  shelters = [],
  selectedIncident = null,
  selectedResource = null,
  viewMode = 'reports',
  onSelectIncident,
  onSelectResource,
  center = [20.2975, 85.8290]
}) {
  const showIncidents = !viewMode || viewMode === 'reports' || viewMode === 'heatmap'
  const showResources = viewMode === 'resources' || viewMode === 'reports'

  const incList = Array.isArray(incidents) ? incidents : (incidents?.incidents || [])
  const resList = Array.isArray(resources) ? resources : (resources?.resources || [])
  const shelterList = Array.isArray(shelters) ? shelters : (shelters?.shelters || [])

  return (
    <MapContainer center={center} zoom={12} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterOnSelect incident={selectedIncident} resource={selectedResource} />
      <FitMapBounds incidents={incidents} resources={resources} selectedIncident={selectedIncident} />

      {/* Heatmap mode */}
      {viewMode === 'heatmap' &&
        incList.map((rawInc) => {
          const lat = rawInc.lat ?? rawInc.location?.coordinates?.[1]
          const lng = rawInc.lng ?? rawInc.location?.coordinates?.[0]
          if (lat == null || lng == null) return null
          const sevMap = { 5: 'Critical', 4: 'High', 3: 'Medium', 2: 'Low', 1: 'Low' }
          const severity = typeof rawInc.severity === 'number' ? (sevMap[rawInc.severity] || 'Medium') : (rawInc.severity || 'Medium')
          return (
            <Circle
              key={`heat-${rawInc.id || rawInc._id}`}
              center={[lat, lng]}
              radius={severity === 'Critical' ? 900 : severity === 'High' ? 650 : 400}
              pathOptions={{
                color: severityColor[severity] || '#5c6b7a',
                fillColor: severityColor[severity] || '#5c6b7a',
                fillOpacity: 0.25,
                weight: 0
              }}
            />
          )
        })}

      {showIncidents &&
        incList.map((rawInc) => {
          const lat = rawInc.lat ?? rawInc.location?.coordinates?.[1]
          const lng = rawInc.lng ?? rawInc.location?.coordinates?.[0]
          if (lat == null || lng == null) return null

          const id = rawInc.id || (rawInc._id ? `INC-${String(rawInc._id).slice(-4).toUpperCase()}` : 'INC')
          const sevMap = { 5: 'Critical', 4: 'High', 3: 'Medium', 2: 'Low', 1: 'Low' }
          const severity = typeof rawInc.severity === 'number' ? (sevMap[rawInc.severity] || 'Medium') : (rawInc.severity || 'Medium')
          const type = rawInc.type ? (String(rawInc.type).charAt(0).toUpperCase() + String(rawInc.type).slice(1)) : 'Incident'
          const status = rawInc.status === 'unallocated' ? 'Unassigned' : rawInc.status === 'allocated' ? 'Assigned' : (rawInc.status || 'Unassigned')
          const description = rawInc.description || 'No description provided.'
          const reportedTime = rawInc.reportedTime || (rawInc.createdAt ? new Date(rawInc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently')

          const formattedInc = {
            ...rawInc,
            id,
            lat,
            lng,
            severity,
            type,
            status,
            description,
            reportedTime
          }

          const isSelected = selectedIncident && (selectedIncident.id === id || selectedIncident.id === rawInc.id || selectedIncident._id === rawInc._id)

          return (
            <Marker
              key={rawInc.id || rawInc._id}
              position={[lat, lng]}
              icon={incidentIcon(severity, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectIncident) {
                    onSelectIncident(formattedInc)
                  }
                }
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                  <p style={{ fontWeight: 800, marginBottom: 4 }}>{id}</p>
                  <p style={{ marginBottom: 2 }}>{type}</p>
                  <p style={{ marginBottom: 4, fontWeight: 700, color: severityColor[severity] || '#5c6b7a' }}>
                    {String(severity).toUpperCase()}
                  </p>
                  <p style={{ fontSize: 12, marginBottom: 4 }}>{description}</p>
                  <p style={{ fontSize: 12, color: '#5c6b7a' }}>Reported: {reportedTime}</p>
                  <p style={{ fontSize: 12, color: '#5c6b7a' }}>Status: {status}</p>
                  {rawInc.resource_name && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #eef1f4' }}>
                      <p style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>
                        🚒 Allocated Resource:
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 600 }}>{rawInc.resource_name}</p>
                      {rawInc.resource_type && (
                        <p style={{ fontSize: 11, color: '#5c6b7a' }}>Type: {rawInc.resource_type}</p>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

      {/* Allocated resources for incidents (shown in reports view as well) */}
      {showIncidents &&
        incList.map((inc) => {
          if (!inc.allocated_resource_id && !inc.resource_id && !inc.resource_name) return null

          const targetId = String(inc.allocated_resource_id || inc.resource_id || '')
          const matchedRes = (resList.length > 0 && targetId)
            ? resList.find((r) => String(r._id || r.id) === targetId)
            : null

          let resLat = inc.resource_location?.coordinates?.[1] ?? inc.assignedResourceLat
          let resLng = inc.resource_location?.coordinates?.[0] ?? inc.assignedResourceLng
          let resName = inc.resource_name || 'Allocated Resource'
          let resType = inc.resource_type || 'Rescue Team'

          if (matchedRes) {
            resLat = resLat ?? matchedRes.lat ?? matchedRes.location?.coordinates?.[1]
            resLng = resLng ?? matchedRes.lng ?? matchedRes.location?.coordinates?.[0]
            resName = matchedRes.name || matchedRes.id || resName
            resType = matchedRes.type || resType
          }

          if (resLat == null || resLng == null) return null

          return (
            <Marker
              key={`allocated-res-${inc.id || inc._id}`}
              position={[resLat, resLng]}
              icon={resourceIcon(resType)}
              eventHandlers={{
                click: () => {
                  if (onSelectResource) {
                    const targetId = String(inc.allocated_resource_id || inc.resource_id)
                    const matchedRes = resList.find((r) => String(r._id || r.id) === targetId)
                    if (matchedRes) {
                      onSelectResource(matchedRes)
                    } else {
                      onSelectResource({
                        _id: targetId,
                        name: resName,
                        type: resType,
                        status: 'Deployed',
                        location: inc.resource_location
                      })
                    }
                  }
                }
              }}
            >
              <Popup>
                {renderResourcePopupContent(
                  matchedRes || {
                    name: resName,
                    type: resType,
                    status: 'Deployed',
                    location: inc.resource_location
                  },
                  inc.id || (inc._id ? `INC-${String(inc._id).slice(-4).toUpperCase()}` : 'Incident')
                )}
              </Popup>
            </Marker>
          )
        })}

      {/* List resources */}
      {showResources &&
        resList.map((res) => {
          const lat = res.lat ?? res.location?.coordinates?.[1]
          const lng = res.lng ?? res.location?.coordinates?.[0]
          if (lat == null || lng == null) return null

          const id = res.id || res.name || (res._id ? `RES-${String(res._id).slice(-4).toUpperCase()}` : 'RES')
          const type = res.type || 'Rescue Team'
          const status = res.status || 'Available'
          const capacity = res.capacity || res.shelter?.capacity_total || 'N/A'

          return (
            <Marker 
              key={res.id || res._id} 
              position={[lat, lng]} 
              icon={resourceIcon(type)}
              eventHandlers={{
                click: () => {
                  if (onSelectResource) {
                    onSelectResource(res)
                  }
                }
              }}
            >
              <Popup>
                {renderResourcePopupContent(res)}
              </Popup>
            </Marker>
          )
        })}

      {showResources &&
        shelterList.map((s) => {
          const lat = s.lat ?? s.location?.coordinates?.[1]
          const lng = s.lng ?? s.location?.coordinates?.[0]
          if (lat == null || lng == null) return null
          return (
            <Marker key={s.id || s._id} position={[lat, lng]} icon={shelterIcon()}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                  <p style={{ fontWeight: 800, marginBottom: 4 }}>{s.name}</p>
                  <p style={{ fontSize: 12, marginBottom: 4 }}>
                    {s.occupied || 0} / {s.capacity || s.shelter?.capacity_total || 0} occupied
                  </p>
                  <p style={{ fontSize: 12, color: '#5c6b7a' }}>Status: {s.status || 'Available'}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}

      {/* Connection line between each assigned incident and its allocated resource */}
      {incList.map((inc) => {
        const incLat = inc.lat ?? inc.location?.coordinates?.[1]
        const incLng = inc.lng ?? inc.location?.coordinates?.[0]

        let resLat = inc.resource_location?.coordinates?.[1] ?? inc.assignedResourceLat
        let resLng = inc.resource_location?.coordinates?.[0] ?? inc.assignedResourceLng

        if (
          (resLat == null || resLng == null) &&
          (inc.allocated_resource_id || inc.resource_id) &&
          resList.length > 0
        ) {
          const targetId = String(inc.allocated_resource_id || inc.resource_id)
          const matchedRes = resList.find((r) => String(r._id || r.id) === targetId)
          if (matchedRes) {
            resLat = matchedRes.lat ?? matchedRes.location?.coordinates?.[1]
            resLng = matchedRes.lng ?? matchedRes.location?.coordinates?.[0]
          }
        }

        if (incLat != null && incLng != null && resLat != null && resLng != null) {
          return (
            <Polyline
              key={`line-${inc.id || inc._id}`}
              positions={[
                [incLat, incLng],
                [resLat, resLng]
              ]}
              pathOptions={{ color: '#2f6fed', weight: 3, dashArray: '6 6' }}
            />
          )
        }
        return null
      })}
    </MapContainer>
  )
}

export default MapView
