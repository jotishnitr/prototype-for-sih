// Mock data for ResQNet prototype
// In a real deployment this would come from a backend API

export const incidents = [
  {
    id: "INC-1042",
    type: "Person Trapped",
    severity: "Critical",
    lat: 20.2961,
    lng: 85.8245,
    status: "Unassigned",
    description: "3 people reported trapped inside a collapsed house near the riverbank.",
    reportedTime: "10 mins ago",
    sector: "Sector A"
  },
  {
    id: "INC-1043",
    type: "Flood",
    severity: "High",
    lat: 20.3105,
    lng: 85.8402,
    status: "Unassigned",
    description: "Water level rising fast, several homes already flooded.",
    reportedTime: "18 mins ago",
    sector: "Sector B"
  },
  {
    id: "INC-1044",
    type: "Medical Emergency",
    severity: "Critical",
    lat: 20.2833,
    lng: 85.8100,
    status: "Assigned",
    description: "Elderly person needs urgent medical attention, no way to reach hospital.",
    reportedTime: "25 mins ago",
    sector: "Sector A"
  },
  {
    id: "INC-1045",
    type: "Road Blockage",
    severity: "Medium",
    lat: 20.3020,
    lng: 85.8560,
    status: "Unassigned",
    description: "Fallen tree blocking the main road, ambulances cannot pass.",
    reportedTime: "32 mins ago",
    sector: "Sector C"
  },
  {
    id: "INC-1046",
    type: "Building Damage",
    severity: "Low",
    lat: 20.2900,
    lng: 85.8330,
    status: "Unassigned",
    description: "Cracks appearing in a two storey building wall after heavy wind.",
    reportedTime: "40 mins ago",
    sector: "Sector B"
  },
  {
    id: "INC-1047",
    type: "Landslide",
    severity: "High",
    lat: 20.3180,
    lng: 85.8190,
    status: "Unassigned",
    description: "Loose soil sliding onto the hill road, two houses at risk.",
    reportedTime: "48 mins ago",
    sector: "Sector D"
  }
];

export const resources = [
  {
    id: "TEAM-12",
    type: "Rescue Team",
    lat: 20.2990,
    lng: 85.8280,
    status: "Available",
    capacity: 6
  },
  {
    id: "TEAM-07",
    type: "Rescue Team",
    lat: 20.3060,
    lng: 85.8480,
    status: "Available",
    capacity: 5
  },
  {
    id: "TEAM-15",
    type: "Rescue Team",
    lat: 20.2750,
    lng: 85.8050,
    status: "Available",
    capacity: 4
  },
  {
    id: "AMB-03",
    type: "Ambulance",
    lat: 20.2870,
    lng: 85.8150,
    status: "Available",
    capacity: 2
  },
  {
    id: "AMB-05",
    type: "Ambulance",
    lat: 20.3140,
    lng: 85.8370,
    status: "Deployed",
    capacity: 2
  },
  {
    id: "BOAT-02",
    type: "Rescue Boat",
    lat: 20.3115,
    lng: 85.8420,
    status: "Available",
    capacity: 8
  },
  {
    id: "SUPPLY-01",
    type: "Relief Supply",
    lat: 20.2950,
    lng: 85.8420,
    status: "Available",
    capacity: 100
  }
];

export const shelters = [
  { id: "SHELTER-A", name: "Shelter A", lat: 20.2920, lng: 85.8500, occupied: 320, capacity: 500, status: "Available" },
  { id: "SHELTER-B", name: "Shelter B", lat: 20.3040, lng: 85.8180, occupied: 300, capacity: 300, status: "Full" },
  { id: "SHELTER-C", name: "Shelter C", lat: 20.2810, lng: 85.8350, occupied: 120, capacity: 250, status: "Available" }
];

export const supplies = [
  { name: "Water", percent: 72 },
  { name: "Food", percent: 48 },
  { name: "Medicine", percent: 31 },
  { name: "Blankets", percent: 84 }
];

export const weatherAlert = {
  title: "CYCLONE WARNING",
  area: "Odisha Coast",
  severity: "RED ALERT",
  wind: "85 km/h",
  rainfall: "Heavy",
  isMock: true
};

export const activityFeedSeed = [
  { id: 1, text: "New critical incident reported - INC-1042", type: "critical" },
  { id: 2, text: "Team 15 assigned to INC-1044", type: "assign" },
  { id: 3, text: "Shelter A capacity updated", type: "shelter" },
  { id: 4, text: "New flood report received - INC-1043", type: "report" }
];

// Distance between two lat/lng points in km (haversine formula)
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Which resource types make sense for which incident types
export const suitableResourceMap = {
  "Person Trapped": ["Rescue Team", "Rescue Boat"],
  "Flood": ["Rescue Boat", "Rescue Team"],
  "Medical Emergency": ["Ambulance"],
  "Road Blockage": ["Rescue Team"],
  "Building Damage": ["Rescue Team"],
  "Landslide": ["Rescue Team"],
  "Other": ["Rescue Team", "Ambulance", "Rescue Boat"]
};
