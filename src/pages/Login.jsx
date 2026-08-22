import { useState } from 'react'


function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      setError('Please fill all the fields')
      return
    }

    if (password.length < 4) {
      setError('Password should be at least 4 characters')
      return
    }

    onLogin({ name: name, email: email })
  }

  return (
    <main className="container" style={{ maxWidth: 420, padding: '64px 24px' }}>
      <div className="card" style={{ padding: 26 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Sign In</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
          Please sign in before reporting an incident. This helps authorities know who reported it.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Enter your name"
            />
          </div>

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

          <button type="submit" className="btn btn-primary btn-full">
            Sign In &amp; Continue
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
            This is a prototype login. Any name, email and password (4+ characters) will work.
          </p>
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
