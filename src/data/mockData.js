export const incidents = [];
export const resources = [];
export const shelters = [];
export const supplies = [];
export const weatherAlert = null;
export const activityFeedSeed = [];

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
