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
