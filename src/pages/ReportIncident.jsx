import { useState } from 'react'
import Login from './Login.jsx'

// list of incident types for the dropdown
const incidentTypes = [
  'Flood',
  'Person Trapped',
  'Medical Emergency',
  'Road Blockage',
  'Building Damage',
  'Landslide',
  'Other'
]

// severity options, just a plain array of objects
const severityOptions = [
  { value: 'Low', emoji: '🟢' },
  { value: 'Medium', emoji: '🟡' },
  { value: 'High', emoji: '🟠' },
  { value: 'Critical', emoji: '🔴' }
]

function ReportIncident({ user, setUser }) {
  // form fields
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState('')
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  // fake incident id for the demo, this would come from the backend normally
  const incidentId = 'INC-1042'

  // if user is not logged in yet, show the login page first
  // this is a very simple way to "protect" the report page
  if (!user) {
    return <Login onLogin={setUser} />
  }

  function useMyLocation() {
    setLocError('')

    if (!navigator.geolocation) {
      setLocError('Location is not supported on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setLocation({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4)
        })
      },
      function () {
        // if the user says no to location, just use a sample one for the demo
        setLocError('Could not access location. Using a sample location for the demo.')
        setLocation({ lat: '20.2961', lng: '85.8245' })
      }
    )
  }

  function handleSubmit(e) {
    e.preventDefault()

    // not doing any real validation here, keeping it simple
    if (type === '' || severity === '') {
      alert('Please select incident type and severity')
      return
    }

    setSubmitted(true)
  }

  function resetForm() {
    setSubmitted(false)
    setLocation(null)
    setType('')
    setSeverity('')
    setDescription('')
    setPhoto(null)
  }

  // success screen after submitting
  if (submitted) {
    return (
      <main className="container" style={{ maxWidth: 560, padding: '64px 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Report Received</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Incident ID: {incidentId}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Your report has been sent to the disaster response dashboard.
          </p>
          <button className="btn btn-secondary" onClick={resetForm}>
            Submit Another Report
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="container" style={{ maxWidth: 640, padding: '48px 24px 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Report an Incident</h1>
          <p style={{ color: 'var(--text-muted)' }}>Help authorities understand what is happening around you.</p>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Signed in as <b>{user.name}</b>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 26, marginTop: 22, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Location */}
        <div>
          <label style={labelStyle}>Location</label>
          <button type="button" className="btn btn-outline btn-small" onClick={useMyLocation}>
            📍 Use My Location
          </button>
          {location && (
            <p style={{ fontSize: 13, marginTop: 8, color: 'var(--text-muted)' }}>
              Latitude: {location.lat} &nbsp;|&nbsp; Longitude: {location.lng}
            </p>
          )}
          {locError !== '' && <p style={{ fontSize: 12, marginTop: 6, color: 'var(--orange)' }}>{locError}</p>}
        </div>

        {/* Incident type */}
        <div>
          <label style={labelStyle}>Incident Type</label>
          <select required value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            <option value="" disabled>
              Select incident type
            </option>
            {incidentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label style={labelStyle}>Severity</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {severityOptions.map((s) => (
              <button
                type="button"
                key={s.value}
                onClick={() => setSeverity(s.value)}
                style={{
                  padding: '14px 8px',
                  borderRadius: 8,
                  border: severity === s.value ? '2px solid var(--navy)' : '1px solid var(--border)',
                  background: severity === s.value ? '#eef3fa' : '#fff',
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
                {s.value}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            required
            rows={4}
            placeholder="Describe the situation briefly…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...selectStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Photo */}
        <div>
          <label style={labelStyle}>Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0] || null)}
            style={{ fontSize: 13 }}
          />
          {photo && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{photo.name} selected</p>}
        </div>

        <button type="submit" className="btn btn-primary btn-full">
          Submit Emergency Report
        </button>
      </form>
    </main>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 8,
  color: 'var(--text-main)'
}

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  fontSize: 14,
  background: '#fff'
}

export default ReportIncident
