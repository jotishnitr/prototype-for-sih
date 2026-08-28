# 🚨 ResQNet — Real-Time Disaster Early-Warning & Resource Coordination Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://resqnet-gamma.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-blue)](https://resqnet-fmhd.onrender.com)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-black?logo=socketdotio)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> Built for **NIT Rourkela Internal Hackathon 2026** by **Team Altiora**

🌐 **Live:** https://resqnet-gamma.vercel.app &nbsp;|&nbsp; 🔐 **Demo Login:** `rajesh@ndrf.gov.in` / `Test@1234`

---

## 📌 Problem Statement

**Theme:** Disaster Management | **Category:** Software

During floods, cyclones, and landslides, delayed information flow between citizens, NDRF, and local administration causes poor resource allocation and slower rescue response.

**ResQNet** solves this by building a unified platform that aggregates citizen-reported incidents (geo-tagged), shelter/resource availability, and provides a real-time coordination dashboard for disaster management authorities to allocate rescue teams and relief supplies instantly.

---

## ✅ Expected Outcomes — Delivered

| Outcome | Status |
|---|---|
| Citizen reporting app (geo-tagged, photo, text) | ✅ Implemented |
| Live authority dashboard with heatmap | ✅ Implemented |
| Resource/shelter allocation optimizer | ✅ Implemented |
| SMS fallback for no-internet zones | ✅ Implemented |
| AI severity prediction & resource recommendation | ✅ Implemented |

---

## ✨ Key Features

### 🧠 AI-Powered Incident Analysis
Every incident is analyzed by AI (Gemini + OpenRouter fallback) for:
- Automatic severity prediction (1–5 scale)
- Optimal resource type recommendation
- Multi-model fallback chain for reliability

### 🗺️ Live Coordination Map
- Real-time incident pins colored by severity
- Resource pins (rescue teams, shelters, medical units, supply depots)
- Allocation lines drawn live between incident and dispatched resource
- Heatmap overlay showing disaster hotspot density

### ⚡ Auto Resource Allocation Engine
- MongoDB `$near` geospatial query finds nearest available resource
- AI recommends best resource type before nearest-neighbor search
- Atomic `findOneAndUpdate` prevents race conditions
- WebSocket broadcasts allocation to all officers in jurisdiction instantly

### 📡 Real-Time WebSocket Updates
- New incidents appear on map without page refresh
- Allocation lines draw live when resource dispatched
- High-priority alert feed updates in real time
- Jurisdiction-isolated rooms — each district sees only its data

### 📱 SMS Fallback
- Citizen receives SMS confirmation after incident report
- Resource team receives SMS with incident location on dispatch
- Handles no-internet zone communication via Fast2SMS

### 🏛️ Jurisdiction Isolation
- Each authority officer tied to a geographic jurisdiction
- Data filtered automatically — Puri officer sees only Puri incidents
- Admin role gets cross-jurisdiction view for NDRF HQ

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Leaflet, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB + Mongoose (2dsphere geospatial index) |
| AI | Google Gemini, OpenRouter (Nvidia Nemotron fallback) |
| Maps | OpenStreetMap, Leaflet, Leaflet.heat |
| Weather | OpenWeather API |
| SMS | Fast2SMS |
| Deployment | Render (backend), Vercel (frontend) |

---

## 🏗 System Architecture

```
Citizen Reports Incident (geo-tagged, photo, description)
           │
           ▼
    Backend API (Node.js/Express)
           │
           ├── AI Analysis (Gemini → OpenRouter fallback)
           │      ├── Severity Prediction (1–5)
           │      └── Resource Type Recommendation
           │
           ├── MongoDB (2dsphere indexed)
           │      ├── Incident stored with jurisdiction_id
           │      └── $near query → nearest available resource
           │
           ├── Auto Allocation Engine
           │      └── Atomic findOneAndUpdate (race-condition safe)
           │
           ├── SMS Notification (Fast2SMS)
           │      ├── Citizen confirmation
           │      └── Resource team dispatch alert
           │
           └── WebSocket Broadcast (Socket.IO)
                  └── jurisdiction:OD-PURI room → all authority dashboards
                         ├── incident:new → pin drops on map
                         ├── allocation:created → line draws on map
                         └── alert:new → feed updates
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/jotishnitr/prototype-for-sih.git
cd prototype-for-sih
```

### Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
FAST2SMS_API_KEY=your_key
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
```

```bash
npm start
```

### Frontend
```bash
cd client
npm install
npm run dev
```

---

## 🔐 Demo Access

| Field | Value |
|---|---|
| URL | https://resqnet-gamma.vercel.app/dashboard |
| Email | rajesh@ndrf.gov.in |
| Password | Test@1234 |

---

## 📂 Project Structure

```
ResQNet/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # MapView, StatsCard, AlertCard
│       ├── pages/           # Dashboard, Report, Home
│       └── data/            # mockData fallbacks
│
└── server/                  # Node.js backend
    ├── controllers/         # postIncident, autoAllocate, getStats...
    ├── routes/              # Express route definitions
    ├── models/              # Mongoose schemas
    ├── utils/               # gemini, openrouter, sendSms, wsEvents
    └── middlewares/         # auth (JWT verify)
```

---

## 🎯 Future Enhancements

- GPS live tracking for rescue teams
- Google Maps Distance Matrix for road-aware allocation
- Inbound SMS (citizen texts keyword → incident auto-created)
- IMD RSS feed → auto-generate incidents from weather alerts
- Cross-jurisdiction resource sharing with neighbor alert system
- Mobile application (React Native)
- Multi-language support for regional languages

---

## 👥 Team Altiora — NIT Rourkela

| Name | Role |
|---|---|
| D. Jotish Kumar | Backend & Database |
| Aryan Biswal | Frontend Development |
| Nihal Kumar | Frontend Development |
| Parjanya Soni | Research & Testing |
| Charan Hadaginal | Research & Testing |
| Nikita Kumari | Designer |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

⭐ If ResQNet helped you, consider giving it a star.
