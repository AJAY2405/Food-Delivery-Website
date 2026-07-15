// utils/geocode.js
const cache = new Map();

export const geocodeAddress = async (address) => {
  if (!address) return null;
  if (cache.has(address)) return cache.get(address);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
    );
    const data = await res.json();
    if (!data?.length) {
      cache.set(address, null);
      return null;
    }
    const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    cache.set(address, result);
    return result;
  } catch {
    return null;
  }
};
