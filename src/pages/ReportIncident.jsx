import { useState } from 'react'

const incidentTypes = [
  { label: 'Flood', value: 'flood' },
  { label: 'Landslide', value: 'landslide' },
  { label: 'Cyclone', value: 'cyclone' },
  { label: 'Medical Emergency', value: 'medical' },
  { label: 'Fire', value: 'fire' },
  { label: 'Other', value: 'flood' }
]

const severityOptions = [
  { label: 'Level 1', value: 1, emoji: '🟢' },
  { label: 'Level 2', value: 2, emoji: '🟢' },
  { label: 'Level 3', value: 3, emoji: '🟡' },
  { label: 'Level 4', value: 4, emoji: '🟠' },
  { label: 'Level 5', value: 5, emoji: '🔴' }
]

function ReportIncident() {
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState('')
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('')
  const [address, setAddress] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdIncidentId, setCreatedIncidentId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

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
        setLocError('Could not access location. Using default location.')
        setLocation({ lat: '20.2961', lng: '85.8245' })
      }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!type || !severity) {
      alert('Please select incident type and severity')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const lngVal = location?.lng ? parseFloat(location.lng) : 85.8245
    const latVal = location?.lat ? parseFloat(location.lat) : 20.2961

    const payload = {
      type: type,
      severity: Number(severity),
      location: {
        type: 'Point',
        coordinates: [lngVal, latVal]
      },
      address: address || 'Bhubaneswar, Odisha',
      description: description,
      reporter_phone: reporterPhone || ''
    }

    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/postIncident", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        const newId = data.incident?._id
          ? `INC-${String(data.incident._id).slice(-4).toUpperCase()}`
          : 'INC-SUCCESS'
        setCreatedIncidentId(newId)
        setSubmitted(true)
      } else {
        setErrorMsg(data.message || 'Failed to submit report. Please try again.')
      }
    } catch (err) {
      console.error("Post incident error:", err)
      setErrorMsg('Network error. Failed to reach disaster server.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSubmitted(false)
    setLocation(null)
    setType('')
    setSeverity('')
    setAddress('')
    setReporterPhone('')
    setDescription('')
    setPhoto(null)
    setErrorMsg('')
  }

  if (submitted) {
    return (
      <main className="container" style={{ maxWidth: 560, padding: '64px 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Emergency Report Received</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
            Incident ID: <strong>{createdIncidentId}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Your report has been submitted to the Authority Control Center and live disaster dashboard.
          </p>
          <button className="btn btn-primary" onClick={resetForm}>
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
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Report an Emergency Incident</h1>
          <p style={{ color: 'var(--text-muted)' }}>Public Emergency Hotline - Help authorities dispatch response teams quickly.</p>
        </div>
        <span className="chip chip-low">🌐 Open Public Access</span>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 26, marginTop: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {errorMsg && (
          <div style={{ background: '#ffeeee', border: '1px solid var(--red)', padding: 12, borderRadius: 6, color: 'var(--red)', fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        {/* Location */}
        <div>
          <label style={labelStyle}>Incident Location</label>
          <button type="button" className="btn btn-outline btn-small" onClick={useMyLocation}>
            📍 Use My Current Location
          </button>
          {location && (
            <p style={{ fontSize: 13, marginTop: 8, color: 'var(--text-muted)' }}>
              Latitude: {location.lat} &nbsp;|&nbsp; Longitude: {location.lng}
            </p>
          )}
          {locError !== '' && <p style={{ fontSize: 12, marginTop: 6, color: 'var(--orange)' }}>{locError}</p>}
        </div>

        {/* Address / Landmark */}
        <div>
          <label style={labelStyle}>Address / Landmark</label>
          <input
            type="text"
            placeholder="e.g. Near River Bank, Sector B, Bhubaneswar"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={selectStyle}
          />
        </div>

        {/* Reporter Phone */}
        <div>
          <label style={labelStyle}>Contact Phone Number (Optional)</label>
          <input
            type="tel"
            placeholder="e.g. +91 9876543210"
            value={reporterPhone}
            onChange={(e) => setReporterPhone(e.target.value)}
            style={selectStyle}
          />
        </div>

        {/* Incident type */}
        <div>
          <label style={labelStyle}>Incident Type</label>
          <select required value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            <option value="" disabled>
              Select incident type
            </option>
            {incidentTypes.map((t) => (
              <option key={t.label} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label style={labelStyle}>Severity Level</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {severityOptions.map((s) => (
              <button
                type="button"
                key={s.label}
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
                {s.label}
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
            placeholder="Describe the emergency situation (e.g. trapped individuals, water level)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...selectStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Photo */}
        <div>
          <label style={labelStyle}>Photo Attachment (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0] || null)}
            style={{ fontSize: 13 }}
          />
          {photo && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{photo.name} selected</p>}
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Submitting Report...' : 'Submit Emergency Report'}
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
