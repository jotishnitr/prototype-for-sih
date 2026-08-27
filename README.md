# 🚨 ResQNet - AI-Powered Disaster Response & Resource Coordination Platform

> Real-time disaster early warning, intelligent resource allocation, and emergency response coordination platform built for disaster management authorities.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-black?logo=socketdotio)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-brightgreen?logo=leaflet)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📌 Overview

ResQNet is an AI-powered disaster management platform designed to bridge the communication gap between citizens and disaster response authorities during emergencies such as floods, cyclones, landslides, fires, and medical crises.

The platform enables citizens to report incidents in real time while providing authorities with an intelligent dashboard that automatically prioritizes incidents, recommends suitable rescue resources, visualizes disaster hotspots, and coordinates rescue operations.

---

# ✨ Key Features

## 🚨 Citizen Incident Reporting

- Report disasters with precise geo-location
- AI-powered incident severity prediction
- AI resource recommendation
- Upload incident images
- Detailed incident descriptions
- Real-time submission

Supported incident types:

- Flood
- Landslide
- Fire
- Medical Emergency
- Road Accident
- Building Collapse
- Cyclone
- Other Emergencies

---

## 🧠 AI-Powered Emergency Analysis

Integrated AI analyzes every incoming incident to provide:

- Severity Prediction
- Required Resource Recommendation
- Priority Classification
- Emergency Response Suggestions

Example:

```
Flood Report

↓

AI Severity: Critical

↓

Recommended Resource:
• Rescue Boat
• Medical Team
• NDRF Unit

↓

Auto Allocation
```

---

## 🗺️ Interactive Disaster Map

Authority dashboard provides three different visualization modes:

### Reports

- Live incident markers
- Severity-based colors
- Incident details
- Image preview

### Resources

- Rescue teams
- Medical units
- Shelters
- Relief stock
- Available resources

### Heatmap

AI-weighted disaster hotspot visualization showing high-risk regions based on incident density and severity.

---

## 🤖 Automatic Resource Allocation

Core feature of ResQNet.

When a new incident is reported, the system:

- Finds compatible rescue resources
- Calculates nearest available units
- Estimates response time
- Suggests optimal allocation
- Displays assigned resource on the map

Authorities can:

- Auto Allocate
- Manually Assign Resources

---

## 📡 Real-Time Dashboard

Live operational dashboard displaying:

- Active Incidents
- Units Dispatched
- Shelter Occupancy
- Estimated Response Time
- High Priority Alerts
- Resource Readiness
- Weather Conditions

Updates occur instantly using Socket.IO.

---

## 🔥 Live Heatmap

Severity Weighting:

| Severity | Weight |
|----------|--------|
| Low | 0.3 |
| Medium | 0.5 |
| High | 0.8 |
| Critical | 1.0 |

---

## 🏥 Shelter Management

Track shelters including:

- Capacity
- Occupancy
- Available Beds
- Medical Support
- Food Availability

---

## 🚑 Resource Management

Manage available emergency resources:

- Rescue Teams
- Ambulances
- Medical Units
- Rescue Boats
- Fire Brigades
- Police Units
- Relief Supplies

Each resource maintains:

- Availability
- Current Assignment
- Location
- Distance
- Operational Status

---

## 🌦 Live Weather Information

Integrated weather monitoring provides:

- Temperature
- Weather Condition
- Wind Speed
- Rainfall
- Disaster Risk Indicator

---

## 🔔 High Priority Alert Feed

Real-time emergency notifications including:

- Critical Incidents
- Resource Deployment
- Shelter Updates
- Weather Alerts
- Incident Resolution

---

## 📈 Resource Readiness Dashboard

Monitor emergency preparedness across:

### Shelter & Evacuation

- Shelter Space
- Rescue Personnel
- Boats & Vehicles

### Medical Operations

- Medical Units
- Ambulance Fleet
- Hospital Beds
- Medical Staff

### Relief Stockpile

- Food Packets
- Clean Water
- Medicine Kits
- Blankets

---

## 🛰️ Live Incident Tracking

Authorities can:

- View incident details
- Monitor incident status
- Assign rescue resources
- Resolve incidents
- Monitor response progress

---

# 🧩 System Architecture

```
Citizen

      │

      ▼

Incident Report

      │

      ▼

Backend API

      │

      ▼

AI Analysis
• Severity Prediction
• Resource Recommendation

      │

      ▼

Database

      │

      ▼

Auto Allocation Engine

      │

      ▼

Authority Dashboard

      │

      ▼

Real-Time Updates (Socket.IO)
```

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Leaflet
- React Leaflet
- Leaflet Heat
- Socket.IO Client

---

## Backend

- Node.js
- Express.js
- Socket.IO
- REST API

---

## Database

- MongoDB

---

## AI Integration

- AI Severity Prediction
- AI Resource Recommendation
- Intelligent Priority Analysis

---

## Maps & GIS

- OpenStreetMap
- Leaflet
- Heatmap Visualization

---

## Weather API

- OpenWeather API

---

# ⚡ Real-Time Features

- Live Incident Reporting
- Socket.IO Updates
- Auto Dashboard Refresh
- Live Resource Status
- Live Alerts
- Heatmap Updates
- Instant Allocation Updates

---

# 📂 Project Structure

```
ResQNet/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── sockets/
│   ├── middleware/
│   ├── utils/
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/jotishnitr/prototype-for-sih.git
cd prototype-for-sih
```

---

## Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_secret

OPENWEATHER_API_KEY=your_openweather_api_key

GEMINI_API_KEY=your_gemini_api_key
```

---

## Run Development Server

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

---



# 🎯 Future Enhancements

- GPS Live Tracking for Rescue Teams
- Route Optimization
- SMS & IVR Support
- Offline Incident Reporting
- Drone Surveillance Integration
- IMD Disaster Alert Integration
- Predictive Disaster Analytics
- Multi-Language Support
- Mobile Application

---

# 👥 Team

Developed for an Internal Hackathon at **National Institute of Technology Rourkela**.

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ If you found this project useful, consider giving it a star.
