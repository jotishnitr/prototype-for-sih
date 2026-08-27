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
  const [precautionsList, setPrecautionsList] = useState([])
  const [suggestionsList, setSuggestionsList] = useState([])
  const [estResponseTime, setEstResponseTime] = useState(null)
  const [aiProvider, setAiProvider] = useState('')

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

  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const maxDim = 800
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
          resolve(dataUrl)
        }
        img.onerror = () => resolve(event.target.result)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!type) {
      alert('Please select incident type')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    let photoUrl = ''
    if (photo) {
      try {
        photoUrl = await convertFileToBase64(photo)
      } catch (err) {
        console.error('Failed to read image file:', err)
      }
    }

    const lngVal = location?.lng ? parseFloat(location.lng) : 85.8245
    const latVal = location?.lat ? parseFloat(location.lat) : 20.2961

    const payload = {
      type: type,
      location: {
        type: 'Point',
        coordinates: [lngVal, latVal]
      },
      address: address || 'Bhubaneswar, Odisha',
      description: description,
      reporter_phone: reporterPhone || '',
      photo_url: photoUrl
    }

    if (severity) {
      payload.severity = Number(severity)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 18000)

    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/postIncident", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (response.ok) {
        const newId = data.incident?._id
          ? `INC-${String(data.incident._id).slice(-4).toUpperCase()}`
          : 'INC-SUCCESS'
        setCreatedIncidentId(newId)
        setPrecautionsList(data.precautions || [])
        setSuggestionsList(data.suggestions || [])
        setEstResponseTime(data.estResponseTime || 12.5)
        setAiProvider(data.aiProvider || 'Gemini AI')
        setSubmitted(true)
      } else {
        setErrorMsg(data.message || 'Failed to submit report. Please try again.')
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error("Post incident error:", err)
      if (err.name === 'AbortError') {
        setErrorMsg('Submission timed out. The server is taking longer to respond. Please retry.')
      } else {
        setErrorMsg('Network error. Failed to reach disaster server.')
      }
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
    setPrecautionsList([])
    setSuggestionsList([])
    setEstResponseTime(null)
    setAiProvider('')
  }

  if (submitted) {
    return (
      <main className="container" style={{ maxWidth: 740, padding: '48px 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '36px 28px', borderTop: '5px solid #2fa860' }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark, #0f172a)', marginBottom: 6 }}>
            Emergency Report Received
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: 15, marginBottom: 16 }}>
            Incident Reference Code: <strong style={{ color: 'var(--navy, #1e293b)', background: '#e2e8f0', padding: '3px 8px', borderRadius: 4 }}>{createdIncidentId}</strong>
          </p>

          {/* Response Time Badge */}
          {estResponseTime != null && (
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: '#38bdf8',
              padding: '14px 18px',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 28,
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
            }}>
              <span>⏱️</span>
              <span>Estimated Disaster Unit Response Time: <span style={{ color: '#4ade80', fontSize: 16 }}>~{estResponseTime} Minutes</span></span>
              {aiProvider && (
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '2px 7px', borderRadius: 12 }}>
                  ⚡ {aiProvider}
                </span>
              )}
            </div>
          )}

          {/* AI Precautions & Suggestions Section */}
          {(precautionsList.length > 0 || suggestionsList.length > 0) && (
            <div style={{ textAlign: 'left', marginTop: 12, marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              
              {/* Precautions Card */}
              {precautionsList.length > 0 && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: 18 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#b91c1c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🛡️</span> Immediate Citizen Safety Precautions
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: '1.6' }}>
                    {precautionsList.map((prec, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>{prec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions Card */}
              {suggestionsList.length > 0 && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 18 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0369a1', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚡</span> Operational Dispatch Action Steps
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: '1.6' }}>
                    {suggestionsList.map((sugg, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>{sugg}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: 13, marginBottom: 24 }}>
            Your report has been transmitted to the ResQNet Emergency Control Room & live spatial map.
          </p>

          <button className="btn btn-primary" onClick={resetForm} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 700 }}>
            Submit Another Emergency Report
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
          <label style={labelStyle}>Severity Level (Optional - AI Assessed)</label>
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
          <div
            onClick={() => document.getElementById('incident-photo-input').click()}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: 12,
              padding: '24px 16px',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: 4
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--navy, #1e293b)'
              e.currentTarget.style.background = '#f1f5f9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.background = '#f8fafc'
            }}
          >
            <input
              id="incident-photo-input"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0] || null)}
              style={{ display: 'none' }}
            />

            {photo ? (
              <div>
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Selected preview"
                  style={{
                    maxHeight: 180,
                    maxWidth: '100%',
                    borderRadius: 8,
                    objectFit: 'cover',
                    marginBottom: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dark, #0f172a)' }}>
                  📷 {photo.name}
                </p>
                <span style={{ fontSize: 12, color: 'var(--blue, #2563eb)', marginTop: 4, display: 'inline-block' }}>
                  Click to change photo
                </span>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-dark, #0f172a)', marginBottom: 4 }}>
                  Click or drag incident photo here
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted, #64748b)' }}>
                  Upload damage, flood level, or emergency situation photo (JPG, PNG, WEBP)
                </p>
              </div>
            )}
          </div>
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
