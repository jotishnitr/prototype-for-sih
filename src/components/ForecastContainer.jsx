import { useState, useEffect } from 'react'

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
      const timeoutId = setTimeout(() => controller.abort(), 15000)

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

  useEffect(() => {
    if (isVerified) {
      fetchForecast()
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
          justify: 'space-between',
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
  const isHeuristic = rawProvider.toLowerCase().includes('heuristic') || rawProvider.toLowerCase().includes('manual') || rawProvider.toLowerCase().includes('rule')
  const displayProviderLabel = isHeuristic ? '⚙️ Manual Heuristic Analysis' : '⚡ ResQNet Intelligence Engine'

  const riskLevel = (forecast.risk_level || 'low').toLowerCase()
  const shortagePredictions = forecast.shortage_predictions || []
  const overallAssessment = forecast.overall_assessment || 'Sector operations are proceeding within baseline metrics.'
  const immediateActions = forecast.immediate_actions || []

  // Theme styling based on risk level
  const riskThemes = {
    critical: {
      bg: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
      border: '#f56565',
      badgeBg: '#e53e3e',
      badgeText: '#ffffff',
      icon: '🔴',
      titleColor: '#9b2c2c',
      chipBg: '#fff'
    },
    high: {
      bg: 'linear-gradient(135deg, #fffaf0 0%, #feebc8 100%)',
      border: '#ed8936',
      badgeBg: '#dd6b20',
      badgeText: '#ffffff',
      icon: '🟠',
      titleColor: '#9c4221',
      chipBg: '#fff'
    },
    medium: {
      bg: 'linear-gradient(135deg, #fffff0 0%, #fefcbf 100%)',
      border: '#ecc94b',
      badgeBg: '#d69e2e',
      badgeText: '#ffffff',
      icon: '🟡',
      titleColor: '#744210',
      chipBg: '#fff'
    },
    low: {
      bg: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
      border: '#48bb78',
      badgeBg: '#38a169',
      badgeText: '#ffffff',
      icon: '🟢',
      titleColor: '#22543d',
      chipBg: '#fff'
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
                  {resourceLabels[primaryPrediction.resource_type] || primaryPrediction.resource_type} shortage in ~{primaryPrediction.predicted_shortage_hours}h
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

            {/* Section 1: Shortage Predictions Cards */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔮 Predicted Resource Shortages (Next 2-4 Hours)</span>
              </h3>

              {shortagePredictions.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No critical resource shortages predicted at present.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 14
                }}>
                  {shortagePredictions.map((item, idx) => {
                    const icon = resourceIcons[item.resource_type] || '🚨'
                    const label = resourceLabels[item.resource_type] || item.resource_type
                    const available = item.current_available ?? 0
                    const demand = item.predicted_demand ?? (available + 5)
                    const pct = Math.min(100, Math.round((available / Math.max(1, demand)) * 100))

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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{icon}</span> {label}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: item.predicted_shortage_hours <= 2 ? 'var(--red-bg)' : 'var(--orange-bg)',
                              color: item.predicted_shortage_hours <= 2 ? 'var(--red)' : 'var(--orange)',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              ⏱️ ~{item.predicted_shortage_hours}h left
                            </span>
                          </div>

                          {/* Demand / Availability Progress */}
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>
                              <span>Available: <b>{available}</b></span>
                              <span>Demand: <b>{demand}</b></span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: pct < 50 ? 'var(--red)' : pct < 80 ? 'var(--orange)' : 'var(--green)',
                                transition: 'width 0.4s ease'
                              }} />
                            </div>
                          </div>

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

            {/* Section 2: Assessment & Immediate Actions */}
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

                {/* Context Stats Bar */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <span style={{ fontSize: '11px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                    Active Incidents: <b>{context.active_incidents ?? 0}</b>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                    Critical: <b style={{ color: 'var(--red)' }}>{context.critical_incidents ?? 0}</b>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                    Active Allocations: <b>{context.active_allocations ?? 0}</b>
                  </span>
                </div>
              </div>

              {/* Immediate Actions Protocol */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚡ Recommended Operational Protocol</span>
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
