# ResQNet

Real-Time Disaster Early-Warning & Resource Coordination Platform (Hackathon PS-05 prototype).

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## What's inside

- `src/pages/Home.jsx` - landing page
- `src/pages/ReportIncident.jsx` - citizen incident report form
- `src/pages/Dashboard.jsx` - authority control center (map, resource allocation, alerts, shelters, SMS demo)
- `src/components/MapView.jsx` - the Leaflet map with incident/resource markers, heatmap toggle, and assignment line
- `src/data/mockData.js` - all mock incidents, resources, shelters and the distance/matching logic

## Demo flow

1. Go to **Report Incident**, fill the form, submit it.
2. Go to **Dashboard**, click a red (critical) marker on the map.
3. In the side panel, click **Auto Find Nearest Resource**.
4. Click **Assign Resource** - watch the incident status change to Assigned, the
   resource change to Deployed, and a dashed line connect them on the map.
5. Try **Simulate Incoming SMS** to see a new incident created from a sample SMS message.

All data is mock/prototype data for the frontend demo - no backend is wired up yet.
