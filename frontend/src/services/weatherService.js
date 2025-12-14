// frontend/src/services/weatherService.js
import api from "../config/api";

// Time slot Vietnamese labels
const SLOT_LABELS = {
  morning: "buổi sáng",
  lunch: "buổi trưa",
  afternoon: "buổi chiều",
  dinner: "buổi tối",
};

// Map TourBuilder columns to weather slots
const COLUMN_TO_SLOT = {
  morning: "morning",
  noon: "lunch",      // TourBuilder uses 'noon', weather uses 'lunch'
  lunch: "lunch",
  afternoon: "afternoon",
  evening: "dinner",  // TourBuilder uses 'evening', weather uses 'dinner'
  dinner: "dinner",
};

/**
 * Get weather forecast for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} slot - Time slot (morning, lunch, afternoon, dinner)
 */
export const getWeatherForecast = async (lat, lon, slot = null) => {
  try {
    const params = { lat, lon };
    if (slot) {
      // Convert column name to weather slot
      params.slot = COLUMN_TO_SLOT[slot] || slot;
    }
    
    const response = await api.get("/weather/forecast", { params });
    return response;
  } catch (error) {
    console.error("Weather service error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Quick check if a time slot has rain warning
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} slot - Time slot
 */
export const checkSlotWeather = async (lat, lon, slot) => {
  try {
    const weatherSlot = COLUMN_TO_SLOT[slot] || slot;
    const response = await api.get("/weather/check-slot", {
      params: { lat, lon, slot: weatherSlot },
    });
    return response;
  } catch (error) {
    console.error("Weather check error:", error);
    return { success: false, shouldWarn: false };
  }
};

/**
 * Get coordinates from restaurant
 * @param {Object} restaurant - Restaurant object
 * @returns {Object|null} {lat, lon} or null
 */
export const getRestaurantCoords = (restaurant) => {
  if (restaurant.location?.coordinates) {
    // MongoDB GeoJSON format: [longitude, latitude]
    return {
      lat: restaurant.location.coordinates[1],
      lon: restaurant.location.coordinates[0],
    };
  }
  // Legacy format
  if (restaurant.lat && restaurant.lon) {
    return { lat: restaurant.lat, lon: restaurant.lon };
  }
  return null;
};

/**
 * Get slot label in Vietnamese
 */
export const getSlotLabel = (slot) => {
  const weatherSlot = COLUMN_TO_SLOT[slot] || slot;
  return SLOT_LABELS[weatherSlot] || slot;
};

/**
 * Check weather and return detailed info
 * @param {Object} restaurant - Restaurant object
 * @param {string} slot - Time slot column name
 * @returns {Object} { shouldWarn, weather, message }
 */
export const checkWeatherWarning = async (restaurant, slot) => {
  const coords = getRestaurantCoords(restaurant);
  
  if (!coords) {
    // No coordinates available, skip weather check
    return { shouldWarn: false, weather: null };
  }

  const result = await checkSlotWeather(coords.lat, coords.lon, slot);
  
  if (result.success && result.weather) {
    return {
      shouldWarn: result.shouldWarn,
      weather: result.weather,
      message: result.message,
      precipitation: result.weather.precipitation,
      slotLabel: getSlotLabel(slot),
    };
  }

  return { shouldWarn: false, weather: null };
};
