import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const resourceIcons = {
  rescue_team: '👨‍🚒',
  medical_unit: '🚑',
  shelter: '🏠',
  supply_depot: '📦'
}

const resourceLabels = {
  rescue_team: 'Rescue Team',
  medical_unit: 'Medical Unit',
  shelter: 'Shelter Capacity',
  supply_depot: 'Supply Depot'
}

function ForecastContainer({ isVerified }) {
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(true)
  const [showExplanation, setShowExplanation] = useState(true)
  const [checkedActions, setCheckedActions] = useState({})

  async function fetchForecast() {
    setLoading(true)
    setError(null)

    // Try primary render URL, fallback to relative local route if needed
    const urls = [
      "https://resqnet-fmhd.onrender.com/api/getForecast",
      "/api/getForecast",
      "/api/forecast"
    ]

    let success = false
    for (const url of urls) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000)

      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          setForecastData(data)
          success = true
          break
        }
      } catch (err) {
        clearTimeout(timeoutId)
        // Try next fallback URL
      }
    }

    if (!success) {
      setError("Unable to retrieve live forecast from ResQNet Intelligence Engine.")
    }
    setLoading(false)
  }

  // Initial fetch and Socket.io reactive listener for real-time updates (Rule 10)
  useEffect(() => {
    if (isVerified) {
      fetchForecast()
    }

    // Reactive listener across incident & resource socket events
    let socket;
    try {
      socket = io('https://resqnet-fmhd.onrender.com', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      })

      const handleTelemetryUpdate = () => {
        fetchForecast()
      }

      socket.on('incident_created', handleTelemetryUpdate)
      socket.on('incident_updated', handleTelemetryUpdate)
      socket.on('incident_resolved', handleTelemetryUpdate)
      socket.on('allocation_created', handleTelemetryUpdate)
      socket.on('resource_updated', handleTelemetryUpdate)
    } catch (e) {
      // Fallback silently if socket connection unavailable
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [isVerified])

  const toggleActionCheck = (idx) => {
    setCheckedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }))
  }

  if (loading && !forecastData) {
    return (
      <div className="container" style={{ margin: '16px auto 0' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div className="live-pulse-dot" style={{ background: 'var(--blue)' }} />
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Analyzing sector metrics with ResQNet Intelligence Engine ...
          </span>
        </div>
      </div>
    )
  }

  if (error && !forecastData) {
    return (
      <div className="container" style={{ margin: '16px auto 0' }}>
        <div style={{
          background: '#fff5f5',
          borderRadius: 'var(--radius)',
          padding: '14px 20px',
          border: '1px solid #feb2b2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 600 }}>
            ⚠️ {error}
          </span>
          <button
            className="btn btn-small"
            onClick={fetchForecast}
            style={{ fontSize: '12px', padding: '4px 10px', background: '#fff', border: '1px solid #feb2b2', color: 'var(--red)' }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  const forecast = forecastData?.forecast || {}
  const context = forecastData?.context || {}
  const rawProvider = forecastData?.aiProvider || ''
  const isHeuristic = rawProvider.toLowerCase().includes('heuristic') || rawProvider.toLowerCase().includes('manual') || rawProvider.toLowerCase().includes('telemetry')
  const displayProviderLabel = isHeuristic ? '⚙️ Manual Heuristic Analysis' : '⚡ ResQNet Intelligence Engine'

  const riskLevel = (forecast.risk_level || 'low').toLowerCase()
  const confidencePct = forecast.confidence_pct // Rule 8: If missing, hide badge
  const shortagePredictions = forecast.shortage_predictions || []
  const whyThisForecast = forecast.why_this_forecast || []
  const overallAssessment = forecast.overall_assessment || 'Sector operations are proceeding within baseline metrics.'
  const immediateActions = forecast.immediate_actions || []

  // Rule 12: Insufficient Data Handling
  if (forecast.insufficient_data) {
    return (
      <div className="container" style={{ margin: '16px auto 0' }}>
        <div style={{
          background: '#f8fafc',
          borderRadius: '10px',
          padding: '16px 20px',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between'
        }}>
          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
            ℹ️ Insufficient operational data to generate a reliable forecast.
          </span>
          <button
            className="btn btn-small"
            onClick={fetchForecast}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    )
  }

  // Theme styling based on risk level (Rule 9)
  const riskThemes = {
    critical: {
      bg: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
      border: '#f56565',
      badgeBg: '#e53e3e',
      badgeText: '#ffffff',
      icon: '🔴',
      titleColor: '#9b2c2c'
    },
    medium: {
      bg: 'linear-gradient(135deg, #fffff0 0%, #fefcbf 100%)',
      border: '#ecc94b',
      badgeBg: '#d69e2e',
      badgeText: '#ffffff',
      icon: '🟡',
      titleColor: '#744210'
    },
    low: {
      bg: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
      border: '#48bb78',
      badgeBg: '#38a169',
      badgeText: '#ffffff',
      icon: '🟢',
      titleColor: '#22543d'
    }
  }

  const currentTheme = riskThemes[riskLevel] || riskThemes.low
  const primaryPrediction = shortagePredictions[0]

  return (
    <div className="container" style={{ margin: '16px auto 0' }}>
      <div style={{
        background: currentTheme.bg,
        border: `1.5px solid ${currentTheme.border}`,
        borderRadius: '10px',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}>

        {/* --- Top Banner Bar --- */}
        <div style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: expanded ? `1px solid ${currentTheme.border}` : 'none'
        }}>
          {/* Left: Risk indicator & Top Forecast Headline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
            <span style={{
              background: currentTheme.badgeBg,
              color: currentTheme.badgeText,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span className="live-pulse-dot" style={{ background: '#fff', width: 6, height: 6 }} />
              {currentTheme.icon} FORECAST: {riskLevel.toUpperCase()} RISK
            </span>

            {primaryPrediction && (
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: currentTheme.titleColor, fontSize: '14px' }}>
                  {resourceLabels[primaryPrediction.resource_type] || primaryPrediction.resource_type} — {primaryPrediction.resource_gap > 0 ? `Gap: ${primaryPrediction.resource_gap} units` : 'No Shortage'}
                </span>
                {primaryPrediction.recommendation && (
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                    💡 {primaryPrediction.recommendation}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Controls & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Rule 8: Hide confidence badge if AI model does not return confidence score */}
            {typeof confidencePct === 'number' && confidencePct > 0 && (
              <span style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'var(--navy)',
                fontWeight: 700
              }}>
                🎯 AI Confidence: <b>{confidencePct}%</b>
              </span>
            )}

            <span style={{
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid var(--border)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              {displayProviderLabel}
            </span>

            <button
              onClick={fetchForecast}
              disabled={loading}
              title="Refresh AI Forecast"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span style={{ display: 'inline-block', transform: loading ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                🔄
              </span>
              {loading ? 'Analyzing...' : 'Refresh'}
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-main)'
              }}
            >
              {expanded ? 'Hide Details ▲' : 'View Details ▼'}
            </button>
          </div>
        </div>

        {/* --- Expanded Detailed View --- */}
        {expanded && (
          <div style={{ padding: '20px', background: '#ffffff' }}>

            {/* --- Collapsible AI Explanation Panel ("Why this forecast?") --- */}
            <div style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              marginBottom: 20
            }}>
              <div
                onClick={() => setShowExplanation(!showExplanation)}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🔍 Why this forecast? (Explainable AI Decision Audit)</span>
                </h4>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {showExplanation ? 'Collapse ▲' : 'Expand Explanation ▼'}
                </span>
              </div>

              {showExplanation && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #cbd5e1' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Real-time operational statistics:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                    {whyThisForecast.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Section 1: Resource Shortage Cards */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔮 Resource Availability & Gap Analysis</span>
              </h3>

              {shortagePredictions.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No critical resource shortages predicted at present.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))',
                  gap: 14
                }}>
                  {shortagePredictions.map((item, idx) => {
                    const icon = resourceIcons[item.resource_type] || '🚨'
                    const label = resourceLabels[item.resource_type] || item.resource_type
                    const total = item.total_units ?? 0
                    const allocated = item.allocated_units ?? 0
                    const available = item.available_units ?? 0
                    const required = item.estimated_required ?? total
                    const gap = item.resource_gap ?? Math.max(0, required - available)
                    const util = item.utilization_pct ?? (total > 0 ? Math.round((allocated / total) * 100) : 0)

                    const riskStatus = item.risk_status || (gap > 0 ? 'Critical Risk' : util >= 50 ? 'Moderate Risk' : 'Low Risk')

                    return (
                      <div key={idx} style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        gap: 10
                      }}>
                        <div>
                          {/* Card Header: Icon, Name & Risk Status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{icon}</span> {label}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: riskStatus === 'Critical Risk' ? 'var(--red-bg)' : riskStatus === 'Moderate Risk' ? 'var(--orange-bg)' : 'var(--green-bg)',
                              color: riskStatus === 'Critical Risk' ? 'var(--red)' : riskStatus === 'Moderate Risk' ? 'var(--orange)' : 'var(--green)',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {riskStatus}
                            </span>
                          </div>

                          {/* Computed Metrics Table (Rule 2 & 3) */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '4px 12px',
                            fontSize: '12px',
                            background: '#ffffff',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            marginBottom: 8
                          }}>
                            <div>Total Units: <b>{total}</b></div>
                            <div>Allocated: <b>{allocated}</b></div>
                            <div>Available: <b style={{ color: available === 0 ? 'var(--red)' : 'var(--green)' }}>{available}</b></div>
                            <div>Required: <b>{required}</b></div>
                            <div style={{ gridColumn: 'span 2', paddingTop: 2, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Resource Gap:</span>
                              {/* Rule 3: Resource Gap = Required - Available. If Available >= Required, show "No Shortage" */}
                              <b style={{ color: gap > 0 ? 'var(--red)' : 'var(--green)' }}>
                                {gap > 0 ? `⚠️ ${gap} units` : 'No Shortage'}
                              </b>
                            </div>
                          </div>

                          {/* Resource Utilization Progress Bar (Rule 4) */}
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: 3 }}>
                              <span>Resource Utilization</span>
                              <b>{util}%</b>
                            </div>
                            <div style={{ width: '100%', height: 7, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.min(100, util)}%`,
                                height: '100%',
                                background: util >= 80 ? 'var(--red)' : util >= 50 ? 'var(--orange)' : 'var(--green)',
                                transition: 'width 0.4s ease'
                              }} />
                            </div>
                          </div>

                          {/* Dynamic Recommendation (Rule 7) */}
                          <div style={{
                            background: '#ffffff',
                            border: '1px solid var(--border)',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: 'var(--text-main)',
                            lineHeight: '1.4'
                          }}>
                            💡 <b>Rec:</b> {item.recommendation}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Assessment & Immediate Actions (Rule 5) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
              borderTop: '1px dashed var(--border)',
              paddingTop: 16
            }}>
              {/* Overall Assessment */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📋 AI Situation Summary</span>
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>
                  {overallAssessment}
                </p>

                {/* Context Stats Bar (Rule 5 & 11) */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <span style={{ fontSize: '11px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                    Active Incidents: <b>{context.active_incidents ?? 0}</b>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                    Critical: <b style={{ color: 'var(--red)' }}>{context.critical_incidents ?? 0}</b>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                    Unassigned: <b style={{ color: (context.unassigned_incidents || 0) > 0 ? 'var(--orange)' : 'var(--green)' }}>{context.unassigned_incidents ?? 0}</b>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                    Allocated Units: <b>{context.total_allocated ?? 0}</b>
                  </span>
                </div>
              </div>

              {/* Immediate Actions Protocol */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚡ Action Protocol</span>
                </h4>
                {immediateActions.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No immediate actions pending.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {immediateActions.map((act, i) => (
                      <label
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: '12.5px',
                          color: checkedActions[i] ? 'var(--text-muted)' : 'var(--text-main)',
                          textDecoration: checkedActions[i] ? 'line-through' : 'none',
                          cursor: 'pointer',
                          background: '#ffffff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!checkedActions[i]}
                          onChange={() => toggleActionCheck(i)}
                          style={{ marginTop: 2, cursor: 'pointer' }}
                        />
                        <span>{act}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default ForecastContainer
