/**
 * OSRM Service - Open Source Routing Machine API Integration
 * 
 * Cung cấp routing dựa trên OpenStreetMap để tính khoảng cách 
 * và lộ trình theo đường đi thực tế (không phải đường chim bay).
 * 
 * API: https://router.project-osrm.org (public demo server)
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';

// Cache để tránh gọi API lặp lại
const routeCache = new Map();

/**
 * Tạo cache key từ tọa độ
 */
const getCacheKey = (coordinates) => {
  return coordinates.map(c => `${c[0].toFixed(5)},${c[1].toFixed(5)}`).join('|');
};

/**
 * Decode polyline từ OSRM (polyline6 format)
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} Array of [lat, lng] coordinates
 */
const decodePolyline = (encoded) => {
  if (!encoded) return [];
  
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    // OSRM uses precision 6, so divide by 1e6
    points.push([lat / 1e6, lng / 1e6]);
  }

  return points;
};

/**
 * Lấy route giữa các điểm
 * @param {Array} coordinates - Array of [lon, lat] (OSRM format: longitude first!)
 * @returns {Object} { geometry, distance, duration, success }
 */
export const getRoute = async (coordinates) => {
  if (!coordinates || coordinates.length < 2) {
    return { success: false, error: 'Need at least 2 coordinates' };
  }

  const cacheKey = getCacheKey(coordinates);
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    // OSRM expects: lon,lat;lon,lat;...
    const coordString = coordinates
      .map(c => `${c[0]},${c[1]}`)
      .join(';');

    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordString}?overview=full&geometries=polyline6`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(data.message || 'No route found');
    }

    const route = data.routes[0];
    const result = {
      success: true,
      geometry: decodePolyline(route.geometry), // [lat, lng] array for Leaflet
      distance: route.distance / 1000, // Convert to km
      duration: route.duration / 60, // Convert to minutes
    };

    // Cache kết quả
    routeCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('OSRM getRoute error:', error);
    return {
      success: false,
      error: error.message,
      geometry: [],
      distance: 0,
      duration: 0,
    };
  }
};

/**
 * Lấy khoảng cách đường đi giữa 2 điểm
 * @param {Object} from - { lat, lon }
 * @param {Object} to - { lat, lon }
 * @returns {Object} { distance (km), duration (minutes), success }
 */
export const getRouteDistance = async (from, to) => {
  if (!from?.lat || !from?.lon || !to?.lat || !to?.lon) {
    return { success: false, distance: null, duration: null };
  }

  const coordinates = [
    [from.lon, from.lat], // OSRM: lon,lat
    [to.lon, to.lat],
  ];

  const result = await getRoute(coordinates);
  
  return {
    success: result.success,
    distance: result.distance,
    duration: result.duration,
  };
};

/**
 * Tính khoảng cách đường đi cho nhiều điểm (batch)
 * Sử dụng OSRM Table service để optimize performance
 * @param {Object} origin - { lat, lon }
 * @param {Array} destinations - Array of { lat, lon }
 * @returns {Array} Array of { distance, duration }
 */
export const getDistanceMatrix = async (origin, destinations) => {
  if (!origin?.lat || !origin?.lon || !destinations?.length) {
    return destinations.map(() => ({ distance: null, duration: null }));
  }

  try {
    // Build coordinates: origin first, then all destinations
    const allCoords = [
      [origin.lon, origin.lat],
      ...destinations.map(d => [d.lon || d.location?.coordinates?.[0], d.lat || d.location?.coordinates?.[1]])
    ].filter(c => c[0] && c[1]);

    if (allCoords.length < 2) {
      return destinations.map(() => ({ distance: null, duration: null }));
    }

    const coordString = allCoords.map(c => `${c[0]},${c[1]}`).join(';');
    
    // sources=0 means origin is at index 0
    // destinations=1;2;3;... means all other points
    const destIndices = destinations.map((_, i) => i + 1).join(';');
    
    const url = `${OSRM_BASE_URL}/table/v1/driving/${coordString}?sources=0&destinations=${destIndices}&annotations=distance,duration`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM Table API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error(data.message || 'Table request failed');
    }

    // data.distances[0] = distances from origin to all destinations
    // data.durations[0] = durations from origin to all destinations
    return destinations.map((_, i) => ({
      distance: data.distances?.[0]?.[i] ? data.distances[0][i] / 1000 : null, // km
      duration: data.durations?.[0]?.[i] ? data.durations[0][i] / 60 : null, // minutes
    }));
  } catch (error) {
    console.error('OSRM getDistanceMatrix error:', error);
    return destinations.map(() => ({ distance: null, duration: null }));
  }
};

/**
 * Lấy lộ trình tối ưu cho nhiều điểm dừng (Traveling Salesman)
 * @param {Array} coordinates - Array of [lon, lat]
 * @param {boolean} roundtrip - Có quay về điểm xuất phát không
 * @returns {Object} { geometry, distance, duration, waypoint_order, success }
 */
export const getOptimizedRoute = async (coordinates, roundtrip = false) => {
  if (!coordinates || coordinates.length < 2) {
    return { success: false, error: 'Need at least 2 coordinates' };
  }

  try {
    const coordString = coordinates
      .map(c => `${c[0]},${c[1]}`)
      .join(';');

    const url = `${OSRM_BASE_URL}/trip/v1/driving/${coordString}?overview=full&geometries=polyline6&roundtrip=${roundtrip}&source=first&destination=last`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM Trip API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.trips || data.trips.length === 0) {
      throw new Error(data.message || 'No optimized route found');
    }

    const trip = data.trips[0];
    
    return {
      success: true,
      geometry: decodePolyline(trip.geometry),
      distance: trip.distance / 1000, // km
      duration: trip.duration / 60, // minutes
      waypoint_order: data.waypoints?.map(w => w.waypoint_index) || [],
    };
  } catch (error) {
    console.error('OSRM getOptimizedRoute error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fallback: Tính khoảng cách Haversine (đường chim bay)
 * Dùng khi OSRM API không available
 */
export const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Clear route cache (useful for testing or memory management)
 */
export const clearRouteCache = () => {
  routeCache.clear();
};

export default {
  getRoute,
  getRouteDistance,
  getDistanceMatrix,
  getOptimizedRoute,
  getHaversineDistance,
  clearRouteCache,
};
