
// Mock geocoding function for demo purposes
// In real app, you'd use a geocoding service like OpenCage, Mapbox, or Google
export const geocodeAddress = async (address) => {
  // For demo, generate random coordinates around Chisinau
  const baseCoords = { lat: 47.0105, lng: 28.8638 };
  const randomOffset = () => (Math.random() - 0.5) * 0.05;
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    lat: baseCoords.lat + randomOffset(),
    lng: baseCoords.lng + randomOffset()
  };
};

export const coordinatesToLatLng = (coords) => {
  return [coords.lat, coords.lng];
};

export const createRandomCoordinatesAroundChisinau = () => {
  const baseCoords = { lat: 47.0105, lng: 28.8638 };
  const randomOffset = () => (Math.random() - 0.5) * 0.1;
  
  return {
    lat: baseCoords.lat + randomOffset(),
    lng: baseCoords.lng + randomOffset()
  };
};
