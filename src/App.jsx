import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ReportIncident from './pages/ReportIncident.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import About from './pages/About.jsx'

function App() {
  const [user, setUser] = useState(null)

  function handleLogin(accesstoken, userInfo) {
    setUser(userInfo)
  }

  function handleLogout() {
    setUser(null)
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route
          path="/dashboard"
          element={<Dashboard onUnauthorized={handleLogout} />}
        />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  )
}

export default App
