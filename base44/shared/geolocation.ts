export async function geocodeLocation(location) {
  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?limit=1&q=${encodeURIComponent(location)}`);
  if (!response.ok) return null;
  const data = await response.json();
  const coordinates = data.features?.[0]?.geometry?.coordinates;
  return coordinates ? { longitude: coordinates[0], latitude: coordinates[1] } : null;
}

export function distanceKm(latitudeA, longitudeA, latitudeB, longitudeB) {
  const radians = Math.PI / 180;
  const latitudeDelta = (latitudeB - latitudeA) * radians;
  const longitudeDelta = (longitudeB - longitudeA) * radians;
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeA * radians) * Math.cos(latitudeB * radians) * Math.sin(longitudeDelta / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(value));
}