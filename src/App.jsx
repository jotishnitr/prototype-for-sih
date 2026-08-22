import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ReportIncident from './pages/ReportIncident.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  // keeping the logged in user here so the ReportIncident page can check it
  // not using any fancy auth library, just plain state for the prototype
  const [user, setUser] = useState(null)

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIncident user={user} setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
