import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView.jsx'
import StatsCard from '../components/StatsCard.jsx'
import IncidentCard from '../components/IncidentCard.jsx'
import AlertCard from '../components/AlertCard.jsx'
import HighPriorityAlerts from '../components/HighPriorityAlerts.jsx'
import ResourceReadiness from '../components/ResourceReadiness.jsx'
import ResourceCard from '../components/ResourceCard.jsx'
import { io } from 'socket.io-client'
import {
  resources as initialResources,
  weatherAlert,
  getDistanceKm
} from '../data/mockData.js'

const typeIcon = {
  'rescue_team': '👨‍🚒',
  'rescue team': '👨‍🚒',
  'ambulance': '🚑',
  'medical_unit': '🏥',
  'medical unit': '🏥',
  'rescue_boat': '🚤',
  'rescue boat': '🚤',
  'relief_supply': '📦',
  'relief supply': '📦',
  'supply_depot': '📦',
  'shelter': '🏠'
}

function Dashboard({ onUnauthorized }) {
  const navigate = useNavigate()

  const [incidents, setIncidents] = useState(null)
  const [resources, setResources] = useState(initialResources)
  const [alerts, setAlerts] = useState([])
  const [readinessData, setReadinessData] = useState(null)
  const [user, setUser] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedResource, setSelectedResource] = useState(null)
  const [viewMode, setViewMode] = useState('reports')
  const [allocating, setAllocating] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [fetchingLocation, setFetchingLocation] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'rescue_team',
    status: 'available',
    lat: '',
    lng: '',
    address: '',
    contact_phone: '',
    shelter_capacity_total: '',
    rescue_team_total_members: '',
    rescue_team_total_boats: '',
    rescue_team_total_vehicles: '',
    medical_unit_total_staff: '',
    medical_unit_total_ambulances: '',
    medical_unit_total_beds: '',
    supply_depot_total_food_packets: '',
    supply_depot_total_water_litres: '',
    supply_depot_total_medicine_kits: '',
    supply_depot_total_blankets: ''
  })

  const selectedIncident = (Array.isArray(incidents) && selectedId != null)
    ? incidents.find((i) => {
      if (!i) return false
      if (typeof selectedId === 'object' && selectedId !== null) {
        return (i._id && selectedId._id === i._id) || (i.id && selectedId.id === i.id)
      }
      const idStr = String(i._id || i.id || '')
      const formattedIncId = i._id ? `INC-${String(i._id).slice(-4).toUpperCase()}` : ''
      const targetIdStr = String(selectedId)
      return idStr === targetIdStr || formattedIncId === targetIdStr
    }) || (typeof selectedId === 'object' && selectedId !== null ? selectedId : null)
    : (typeof selectedId === 'object' && selectedId !== null ? selectedId : null)

  const [activeCount, setActiveCount] = useState(0)
  const [unitsDispatched, setUnitsDispatched] = useState(0)
  const [totalUnits, setTotalUnits] = useState(0)
  const [shelterCapacity, setShelterCapacity] = useState(0)
  const [estResponse, setEstResponse] = useState(0)

  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    async function verifyUser() {
      try {
        const response = await fetch("https://resqnet-fmhd.onrender.com/api/verify", {
          method: "GET",
          credentials: "include"
        })
        if (!response.ok) {
          if (onUnauthorized) onUnauthorized()
          navigate('/login', { replace: true })
          return
        }
        const data = await response.json()
        setUser(data.user)
        setIsVerified(true)
      } catch (err) {
        console.error("User verification failed:", err)
        if (onUnauthorized) onUnauthorized()
        navigate('/login', { replace: true })
      }
    }

    verifyUser()
  }, [onUnauthorized, navigate])

  async function getStats() {
    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/stats", {
        method: "GET",
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setActiveCount(data.activeIncidents ?? 0)
        setUnitsDispatched(data.unitsDispatched ?? 0)
        setTotalUnits(data.resources?.length || 0)
        setShelterCapacity(data.shelterCapacity ?? 0)
        setEstResponse(data.avgResponse ?? 0)
      }
    } catch (err) {
      console.warn("Could not load live stats from server:", err)
    }
  }

  async function getIncidents() {
    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/getIncidentsDetails", {
        method: "GET",
        credentials: "include"
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

  async function getResources() {
    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/getResources", {
        method: "GET",
        credentials: "include"
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

  async function getAlerts() {
    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/getAlerts", {
        method: "GET",
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (err) {
      console.warn("Could not load live alerts from server:", err)
    }
  }

  async function getReadiness() {
    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/getResourceReadiness", {
        method: "GET",
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setReadinessData(data)
      }
    } catch (err) {
      console.warn("Could not load resource readiness from server:", err)
    }
  }

  useEffect(() => {
    if (!isVerified) return

    getStats()
    getIncidents()
    getResources()
    getAlerts()
    getReadiness()
  }, [isVerified])

  // WebSocket connection for real-time alerts
  useEffect(() => {
    if (!isVerified || !user || !user.jurisdiction_id) return

    const socket = io("https://resqnet-fmhd.onrender.com")

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id)
      socket.emit('join:jurisdiction', user.jurisdiction_id)
    })

    socket.on('alert:new', (newAlert) => {
      console.log('New alert received:', newAlert)
      if (newAlert) {
        const targetId = newAlert._id || newAlert.id
        setAlerts((prevAlerts) => {
          const exists = prevAlerts.some(a => (a._id || a.id) === targetId)
          if (exists) {
            return prevAlerts.map(a => (a._id || a.id) === targetId ? newAlert : a)
          } else {
            return [newAlert, ...prevAlerts]
          }
        })
      }
    })

    socket.on('resource:new', (newResource) => {
      console.log('New resource received:', newResource)
      if (newResource) {
        setResources((prev) => {
          const exists = prev.some(r => (r._id || r.id) === (newResource._id || newResource.id))
          if (exists) return prev
          return [newResource, ...prev]
        })
        getStats()
        getReadiness()
      }
    })

    socket.on('allocation:created', (allocation) => {
      console.log('Allocation created event received:', allocation)
      getStats()
      getIncidents()
      getResources()
      getReadiness()
    })

    socket.on('disconnect', () => {
      console.log('Socket.io disconnected')
    })

    return () => {
      socket.disconnect()
    }
  }, [isVerified, user])

  const calculateDistance = (inc, res) => {
    if (!inc?.location?.coordinates || !res?.location?.coordinates) return null
    const [incLng, incLat] = inc.location.coordinates
    const [resLng, resLat] = res.location.coordinates
    return getDistanceKm(incLat, incLng, resLat, resLng)
  }

  const handleAssignResource = async (resource) => {
    if (!selectedIncident) return
    setAllocating(true)
    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/postAllocate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resource_id: resource._id || resource.id,
          incident_id: selectedIncident._id || selectedIncident.id
        }),
        credentials: "include"
      })
      
      if (response.ok) {
        // Refresh all states to update UI
        await getStats()
        await getIncidents()
        await getResources()
        await getReadiness()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to assign resource")
      }
    } catch (err) {
      console.error("Failed to assign resource:", err)
    } finally {
      setAllocating(false)
    }
  }

  const handleAutoAllocate = async () => {
    if (!selectedIncident) return
    setAllocating(true)
    try {
      const incidentId = selectedIncident._id || selectedIncident.id
      const response = await fetch(`https://resqnet-fmhd.onrender.com/api/autoAllocate/${incidentId}`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        // Refresh all states to update UI
        await getStats()
        await getIncidents()
        await getResources()
        await getReadiness()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to autoallocate resource")
      }
    } catch (err) {
      console.error("Failed to autoallocate resource:", err)
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setFetchingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        setFormData(prev => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        }))

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          if (response.ok) {
            const data = await response.json()
            setFormData(prev => ({
              ...prev,
              address: data.display_name || prev.address
            }))
          }
        } catch (err) {
          console.warn("Could not reverse geocode address:", err)
        } finally {
          setFetchingLocation(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Failed to retrieve your current location. Please verify location permissions.")
        setFetchingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitResource = async (e) => {
    e.preventDefault()
    if (!user || !user.jurisdiction_id) {
      alert("User jurisdiction info missing. Please re-login.")
      return
    }

    // Construct request body
    const body = {
      name: formData.name,
      type: formData.type,
      status: formData.status,
      location: {
        type: 'Point',
        coordinates: [parseFloat(formData.lng || 0), parseFloat(formData.lat || 0)]
      },
      address: formData.address,
      contact_phone: formData.contact_phone,
      jurisdiction_id: user.jurisdiction_id
    }

    // Embed type specific attributes
    if (formData.type === 'shelter') {
      body.shelter = {
        capacity_total: parseInt(formData.shelter_capacity_total || 0),
        capacity_remaining: parseInt(formData.shelter_capacity_total || 0)
      }
    } else if (formData.type === 'rescue_team') {
      body.rescue_team = {
        total_members: parseInt(formData.rescue_team_total_members || 0),
        available_members: parseInt(formData.rescue_team_total_members || 0),
        total_boats: parseInt(formData.rescue_team_total_boats || 0),
        available_boats: parseInt(formData.rescue_team_total_boats || 0),
        total_vehicles: parseInt(formData.rescue_team_total_vehicles || 0),
        available_vehicles: parseInt(formData.rescue_team_total_vehicles || 0)
      }
    } else if (formData.type === 'medical_unit') {
      body.medical_unit = {
        total_staff: parseInt(formData.medical_unit_total_staff || 0),
        available_staff: parseInt(formData.medical_unit_total_staff || 0),
        total_ambulances: parseInt(formData.medical_unit_total_ambulances || 0),
        available_ambulances: parseInt(formData.medical_unit_total_ambulances || 0),
        total_beds: parseInt(formData.medical_unit_total_beds || 0),
        available_beds: parseInt(formData.medical_unit_total_beds || 0)
      }
    } else if (formData.type === 'supply_depot') {
      body.supply_depot = {
        total_food_packets: parseInt(formData.supply_depot_total_food_packets || 0),
        available_food_packets: parseInt(formData.supply_depot_total_food_packets || 0),
        total_water_litres: parseInt(formData.supply_depot_total_water_litres || 0),
        available_water_litres: parseInt(formData.supply_depot_total_water_litres || 0),
        total_medicine_kits: parseInt(formData.supply_depot_total_medicine_kits || 0),
        available_medicine_kits: parseInt(formData.supply_depot_total_medicine_kits || 0),
        total_blankets: parseInt(formData.supply_depot_total_blankets || 0),
        available_blankets: parseInt(formData.supply_depot_total_blankets || 0)
      }
    }

    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/postResource", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        credentials: "include"
      })

      if (response.ok) {
        setShowAddModal(false)
        setFormData({
          name: '',
          type: 'rescue_team',
          status: 'available',
          lat: '',
          lng: '',
          address: '',
          contact_phone: '',
          shelter_capacity_total: '',
          rescue_team_total_members: '',
          rescue_team_total_boats: '',
          rescue_team_total_vehicles: '',
          medical_unit_total_staff: '',
          medical_unit_total_ambulances: '',
          medical_unit_total_beds: '',
          supply_depot_total_food_packets: '',
          supply_depot_total_water_litres: '',
          supply_depot_total_medicine_kits: '',
          supply_depot_total_blankets: ''
        })
        // Refresh dashboard lists and metrics
        await getResources()
        await getStats()
        await getReadiness()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to create resource")
      }
    } catch (err) {
      console.error("Error creating resource:", err)
      alert("Failed to connect to the server")
    }
  }

  function selectIncident(inc) {
    setSelectedId(inc.id || inc._id)
    setSelectedResource(null) // Clear resource selection when incident marker is clicked
    getResources() // Reload resources when incident marker is clicked
  }

  function selectResource(res) {
    setSelectedResource(res)
    setSelectedId(null) // Clear incident selection when resource marker is clicked
  }

  const availableResources = (resources || []).filter(res => 
    res.status?.toLowerCase() === 'available'
  )
  const availableResourcesSorted = selectedIncident 
    ? [...availableResources].sort((a, b) => {
        const distA = calculateDistance(selectedIncident, a) ?? Infinity
        const distB = calculateDistance(selectedIncident, b) ?? Infinity
        return distA - distB
      })
    : []

  let selectedResourceCapacityInfo = null
  if (selectedResource) {
    if (selectedResource.type === 'shelter' && selectedResource.shelter) {
      selectedResourceCapacityInfo = `Capacity: ${selectedResource.shelter.capacity_remaining} / ${selectedResource.shelter.capacity_total} vacant`
    } else if (selectedResource.type === 'rescue_team' && selectedResource.rescue_team) {
      selectedResourceCapacityInfo = `Members: ${selectedResource.rescue_team.available_members} / ${selectedResource.rescue_team.total_members} ready`
    } else if (selectedResource.type === 'medical_unit' && selectedResource.medical_unit) {
      selectedResourceCapacityInfo = `Ambulances: ${selectedResource.medical_unit.available_ambulances} | Beds: ${selectedResource.medical_unit.available_beds} | Staff: ${selectedResource.medical_unit.available_staff} ready`
    } else if (selectedResource.type === 'supply_depot' && selectedResource.supply_depot) {
      selectedResourceCapacityInfo = `Food Packets: ${selectedResource.supply_depot.available_food_packets} | Water: ${selectedResource.supply_depot.available_water_litres}L`
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '6px' }}
            >
              ➕ Add New Resource
            </button>
            <span className="chip chip-low" style={{ margin: 0 }}>🟢 System Operational</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container" style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatsCard label="Active Incidents" value={activeCount} accent="var(--red)" />
          <StatsCard label="Units Dispatched" value={`${unitsDispatched}/${totalUnits}`} accent="var(--blue)" />
          <StatsCard label="Shelter Occupancy" value={shelterCapacity} accent="var(--orange)" />
          <StatsCard 
            label="Est. Response" 
            value={typeof estResponse === 'number' ? `${estResponse.toFixed(1)} mins` : `${parseFloat(estResponse || 0).toFixed(1)} mins`} 
            accent="var(--green)" 
          />
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
              selectedResource={selectedResource}
              viewMode={viewMode}
              onSelectIncident={selectIncident}
              onSelectResource={selectResource}
              center={
                incidents && incidents.length > 0 && incidents[0].location?.coordinates
                  ? [incidents[0].location.coordinates[1], incidents[0].location.coordinates[0]]
                  : [22.2528, 84.9119]}
            />
          </div>

          {/* Resource Readiness */}
          <ResourceReadiness data={readinessData} />
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedResource ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={panelTitle}>SELECTED RESOURCE</h3>
              <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: 0 }}>
                      {typeIcon[selectedResource.type?.toLowerCase()] || '📍'} {selectedResource.name || selectedResource.id || 'Unnamed Resource'}
                    </p>
                    <span className={`chip ${selectedResource.status?.toLowerCase() === 'available' ? 'chip-low' : 'chip-neutral'}`} style={{ fontSize: '9.5px', padding: '2px 6px', textTransform: 'uppercase', fontWeight: 700 }}>
                      {selectedResource.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
                    {selectedResource.type ? selectedResource.type.replace('_', ' ').toUpperCase() : 'RESOURCE'}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: 8, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {selectedResourceCapacityInfo && (
                    <p style={{ margin: 0 }}>
                      📈 <strong>Readiness:</strong> {selectedResourceCapacityInfo}
                    </p>
                  )}
                  {selectedResource.location?.address && (
                    <p style={{ margin: 0 }}>
                      📍 <strong>Address:</strong> {selectedResource.location.address}
                    </p>
                  )}
                  {selectedResource.location?.contact_phone && (
                    <p style={{ margin: 0 }}>
                      📞 <strong>Phone:</strong> {selectedResource.location.contact_phone}
                    </p>
                  )}
                </div>
                
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => setSelectedResource(null)}
                  style={{ alignSelf: 'flex-start', padding: '5px 12px', fontSize: '11px', marginTop: 4 }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : selectedIncident ? (
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
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <h3 style={{ ...panelTitle, margin: 0 }}>Available Resources</h3>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={handleAutoAllocate}
                      disabled={allocating}
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                    >
                      🤖 Auto-Allocate
                    </button>
                  </div>

                  <div 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 8, 
                      maxHeight: '260px', 
                      overflowY: 'auto',
                      paddingRight: '4px'
                    }} 
                    className="custom-scrollbar"
                  >
                    {availableResourcesSorted.length > 0 ? (
                      availableResourcesSorted.map((resource) => (
                        <ResourceCard
                          key={resource._id || resource.id}
                          resource={resource}
                          distance={calculateDistance(selectedIncident, resource)}
                          onAssign={handleAssignResource}
                          assigning={allocating}
                        />
                      ))
                    ) : (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '15px 0' }}>
                        No available resources found.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Click any incident or resource marker on the map to view the details.
              </p>
            </div>
          )}

          <AlertCard alert={weatherAlert} />
          <HighPriorityAlerts alerts={alerts} onViewAllLogs={() => setShowLogsModal(true)} />
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
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '18px', fontWeight: 800 }}>➕ Add New Resource</h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitResource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Resource Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Puri Stadium Shelter"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Resource Type *</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange} 
                    style={inputStyle}
                  >
                    <option value="rescue_team">Rescue Team</option>
                    <option value="shelter">Shelter</option>
                    <option value="supply_depot">Supply Depot</option>
                    <option value="medical_unit">Medical Unit</option>
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Status *</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    style={inputStyle}
                  >
                    <option value="available">Available</option>
                    <option value="deployed">Deployed</option>
                    <option value="full">Full</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Latitude *</label>
                  <input 
                    type="number" 
                    step="any"
                    name="lat" 
                    value={formData.lat} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. 20.2975"
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Longitude *</label>
                  <input 
                    type="number" 
                    step="any"
                    name="lng" 
                    value={formData.lng} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. 85.8290"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={formGroupStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>Address</label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={fetchingLocation}
                    style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    📍 {fetchingLocation ? 'Fetching Address...' : 'Use Current Location'}
                  </button>
                </div>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Puri Stadium, Puri"
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Contact Phone</label>
                <input 
                  type="tel" 
                  name="contact_phone" 
                  value={formData.contact_phone} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 9437000803"
                  style={inputStyle}
                />
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Type-Specific Details
                </h4>

                {formData.type === 'shelter' && (
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Total Capacity (People) *</label>
                    <input 
                      type="number" 
                      name="shelter_capacity_total" 
                      value={formData.shelter_capacity_total} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="e.g. 500"
                      style={inputStyle}
                    />
                  </div>
                )}

                {formData.type === 'rescue_team' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Total Members *</label>
                      <input 
                        type="number" 
                        name="rescue_team_total_members" 
                        value={formData.rescue_team_total_members} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="e.g. 10"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Total Boats</label>
                        <input 
                          type="number" 
                          name="rescue_team_total_boats" 
                          value={formData.rescue_team_total_boats} 
                          onChange={handleInputChange} 
                          placeholder="e.g. 2"
                          style={inputStyle}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Total Vehicles</label>
                        <input 
                          type="number" 
                          name="rescue_team_total_vehicles" 
                          value={formData.rescue_team_total_vehicles} 
                          onChange={handleInputChange} 
                          placeholder="e.g. 1"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === 'medical_unit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Total Staff *</label>
                        <input 
                          type="number" 
                          name="medical_unit_total_staff" 
                          value={formData.medical_unit_total_staff} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="e.g. 8"
                          style={inputStyle}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Total Ambulances</label>
                        <input 
                          type="number" 
                          name="medical_unit_total_ambulances" 
                          value={formData.medical_unit_total_ambulances} 
                          onChange={handleInputChange} 
                          placeholder="e.g. 3"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Total Beds *</label>
                      <input 
                        type="number" 
                        name="medical_unit_total_beds" 
                        value={formData.medical_unit_total_beds} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="e.g. 50"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'supply_depot' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Food Packets *</label>
                        <input 
                          type="number" 
                          name="supply_depot_total_food_packets" 
                          value={formData.supply_depot_total_food_packets} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="e.g. 1000"
                          style={inputStyle}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Water Litres *</label>
                        <input 
                          type="number" 
                          name="supply_depot_total_water_litres" 
                          value={formData.supply_depot_total_water_litres} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="e.g. 500"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Medicine Kits</label>
                        <input 
                          type="number" 
                          name="supply_depot_total_medicine_kits" 
                          value={formData.supply_depot_total_medicine_kits} 
                          onChange={handleInputChange} 
                          placeholder="e.g. 100"
                          style={inputStyle}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Blankets</label>
                        <input 
                          type="number" 
                          name="supply_depot_total_blankets" 
                          value={formData.supply_depot_total_blankets} 
                          onChange={handleInputChange} 
                          placeholder="e.g. 200"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  Create Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs History Modal */}
      {showLogsModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--navy)' }}>
                📋 All System Alert Logs
              </h3>
              <button 
                onClick={() => setShowLogsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-muted)' }}>Time</th>
                    <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-muted)' }}>Type</th>
                    <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-muted)' }}>Message / Title</th>
                    <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-muted)' }}>Severity</th>
                    <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts && alerts.length > 0 ? (
                    alerts.map((al, idx) => {
                      if (!al) return null
                      const timeStr = new Date(al.createdAt || al.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                      
                      let severityLabel = 'Low'
                      let severityColor = 'var(--blue)'
                      if (al.severity === 'critical' || al.severity === 'high' || al.severity >= 4) {
                        severityLabel = 'Critical'
                        severityColor = 'var(--red)'
                      } else if (al.severity === 'warning' || al.severity === 'medium' || al.severity >= 2) {
                        severityLabel = 'Medium'
                        severityColor = 'var(--orange)'
                      }

                      return (
                        <tr key={al._id || al.id || idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'var(--bg)' : 'transparent' }}>
                          <td style={{ padding: '12px 12px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '12px' }}>{timeStr}</td>
                          <td style={{ padding: '12px 12px', fontWeight: '700', textTransform: 'uppercase', color: severityColor, fontSize: '11px' }}>
                            {al.type ? al.type.replace('_', ' ') : 'ALERT'}
                          </td>
                          <td style={{ padding: '12px 12px', lineHeight: '1.4' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{al.title}</div>
                            {al.message && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{al.message}</div>}
                          </td>
                          <td style={{ padding: '12px 12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: '800',
                              background: severityColor === 'var(--red)' ? 'var(--red-bg)' : (severityColor === 'var(--orange)' ? 'var(--orange-bg)' : 'var(--blue-bg)'),
                              color: severityColor
                            }}>
                              {severityLabel}
                            </span>
                          </td>
                          <td style={{ padding: '12px 12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: al.status === 'allocated' || al.status === 'resolved' ? 'var(--green-bg)' : 'rgba(0,0,0,0.05)',
                              color: al.status === 'allocated' || al.status === 'resolved' ? 'var(--green)' : 'var(--text-muted)'
                            }}>
                              {al.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No logs available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <button 
                onClick={() => setShowLogsModal(false)}
                className="btn btn-outline"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

const panelTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.02em'
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
}

const modalContentStyle = {
  width: '100%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#ffffff',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  boxSizing: 'border-box'
}

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  textAlign: 'left'
}

const labelStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--text-main)'
}

const inputStyle = {
  padding: '8px 12px',
  fontSize: '13px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
}

export default Dashboard
