import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (email.trim() === '' || password.trim() === '') {
      setError('Please fill all the fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch("https://resqnet-fmhd.onrender.com/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.accesstoken) {
        if (onLogin) {
          onLogin(data.accesstoken, { email })
        }
        navigate('/dashboard')
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (err) {
      console.error("Login error:", err)
      setError('Failed to connect to login server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ maxWidth: 420, padding: '64px 24px' }}>
      <div className="card" style={{ padding: 26 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Sign In</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
          Please sign in to access the Control Center Dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="********"
            />
          </div>

          {error !== '' && (
            <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In & Continue'}
          </button>
        </form>

        {/* Demo Credentials for Judges */}
        <div style={{
          marginTop: 20,
          padding: '14px 16px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          boxShadow: '0 2px 6px rgba(22, 101, 52, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚖️ Demo Credentials for Judges
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('rajesh@ndrf.gov.in')
                setPassword('Test@1234')
              }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                background: '#16a34a',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              ⚡ Auto-Fill
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#14532d', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ margin: 0 }}>
              <strong>Gmail:</strong> <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>rajesh@ndrf.gov.in</code>
            </p>
            <p style={{ margin: 0 }}>
              <strong>Password:</strong> <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>Test@1234</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  fontSize: 14
}

export default Login
