// backend/routes/weatherRoutes.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// Open-Meteo API (Free, no key required)
const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

// Time slot mapping to hours
const TIME_SLOTS = {
  morning: { start: 6, end: 10 },    // 06:00 - 10:00
  lunch: { start: 10, end: 14 },     // 10:00 - 14:00
  afternoon: { start: 14, end: 18 }, // 14:00 - 18:00
  dinner: { start: 18, end: 22 },    // 18:00 - 22:00
};

/**
 * @route   GET /api/weather/forecast
 * @desc    Get weather forecast for a location
 * @access  Public
 * @query   lat, lon - coordinates
 * @query   slot (optional) - time slot to check (morning, lunch, afternoon, dinner)
 */
router.get("/forecast", async (req, res) => {
  try {
    const { lat, lon, slot } = req.query;

    // Default to HCMC if no coords provided
    const latitude = parseFloat(lat) || 10.7769;
    const longitude = parseFloat(lon) || 106.7009;

    // Call Open-Meteo API
    const response = await axios.get(OPEN_METEO_URL, {
      params: {
        latitude,
        longitude,
        hourly: "precipitation_probability,temperature_2m,weathercode",
        timezone: "Asia/Ho_Chi_Minh",
        forecast_days: 1,
      },
      timeout: 5000,
    });

    const hourlyData = response.data.hourly;

    // Parse hourly data
    const forecast = hourlyData.time.map((time, index) => ({
      time,
      hour: new Date(time).getHours(),
      precipitation_probability: hourlyData.precipitation_probability[index],
      temperature: hourlyData.temperature_2m[index],
      weathercode: hourlyData.weathercode[index],
    }));

    // If slot is specified, calculate rain warning for that slot
    let slotWarning = null;
    if (slot && TIME_SLOTS[slot]) {
      const { start, end } = TIME_SLOTS[slot];
      const slotHours = forecast.filter((f) => f.hour >= start && f.hour < end);

      if (slotHours.length > 0) {
        const avgPrecipitation =
          slotHours.reduce((sum, h) => sum + h.precipitation_probability, 0) /
          slotHours.length;
        const maxPrecipitation = Math.max(
          ...slotHours.map((h) => h.precipitation_probability)
        );

        slotWarning = {
          slot,
          timeRange: `${String(start).padStart(2, "0")}:00 - ${String(end).padStart(2, "0")}:00`,
          avgPrecipitation: Math.round(avgPrecipitation),
          maxPrecipitation,
          shouldWarn: maxPrecipitation >= 50,
          message:
            maxPrecipitation >= 50
              ? `Dự báo có mưa (${maxPrecipitation}%) trong khung giờ này. Nên cân nhắc quán có mái che.`
              : null,
        };
      }
    }

    res.json({
      success: true,
      location: { latitude, longitude },
      forecast,
      slotWarning,
    });
  } catch (error) {
    console.error("Weather API error:", error.message);
    res.status(500).json({
      success: false,
      message: "Không thể lấy dữ liệu thời tiết",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/weather/check-slot
 * @desc    Get detailed weather info for a time slot
 * @access  Public
 */
router.get("/check-slot", async (req, res) => {
  try {
    const { lat, lon, slot } = req.query;

    if (!slot || !TIME_SLOTS[slot]) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp slot hợp lệ (morning, lunch, afternoon, dinner)",
      });
    }

    const latitude = parseFloat(lat) || 10.7769;
    const longitude = parseFloat(lon) || 106.7009;

    const response = await axios.get(OPEN_METEO_URL, {
      params: {
        latitude,
        longitude,
        hourly: "precipitation_probability,temperature_2m,weathercode",
        timezone: "Asia/Ho_Chi_Minh",
        forecast_days: 1,
      },
      timeout: 5000,
    });

    const hourlyData = response.data.hourly;
    const { start, end } = TIME_SLOTS[slot];

    // Get data for slot hours
    const slotData = hourlyData.time
      .map((time, index) => ({
        hour: new Date(time).getHours(),
        precipitation: hourlyData.precipitation_probability[index],
        temperature: hourlyData.temperature_2m[index],
        weathercode: hourlyData.weathercode[index],
      }))
      .filter((h) => h.hour >= start && h.hour < end);

    if (slotData.length === 0) {
      return res.json({
        success: true,
        slot,
        weather: null,
        message: "Không có dữ liệu thời tiết cho khung giờ này",
      });
    }

    // Calculate averages and get dominant weather
    const avgTemp = Math.round(
      slotData.reduce((sum, h) => sum + h.temperature, 0) / slotData.length
    );
    const maxPrecipitation = Math.max(...slotData.map((h) => h.precipitation));
    
    // Get most common weathercode
    const weatherCounts = {};
    slotData.forEach((h) => {
      weatherCounts[h.weathercode] = (weatherCounts[h.weathercode] || 0) + 1;
    });
    const dominantCode = parseInt(
      Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0]
    );

    // Interpret weather code to Vietnamese
    const weatherInfo = interpretWeatherCode(dominantCode);
    const shouldWarn = maxPrecipitation >= 50 || weatherInfo.isRainy;

    res.json({
      success: true,
      slot,
      weather: {
        temperature: avgTemp,
        precipitation: maxPrecipitation,
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        isRainy: weatherInfo.isRainy,
      },
      shouldWarn,
      message: shouldWarn
        ? `Dự báo ${weatherInfo.description.toLowerCase()} (${maxPrecipitation}% mưa). Nên cân nhắc quán có mái che.`
        : `Thời tiết: ${weatherInfo.description}, ${avgTemp}°C`,
    });
  } catch (error) {
    console.error("Weather check error:", error.message);
    res.status(500).json({
      success: false,
      message: "Không thể kiểm tra thời tiết",
    });
  }
});

/**
 * Interpret WMO weather code to Vietnamese
 * Reference: https://open-meteo.com/en/docs
 */
function interpretWeatherCode(code) {
  const weatherMap = {
    0: { condition: "clear", description: "Trời quang", icon: "☀️", isRainy: false },
    1: { condition: "mainly_clear", description: "Ít mây", icon: "🌤️", isRainy: false },
    2: { condition: "partly_cloudy", description: "Có mây", icon: "⛅", isRainy: false },
    3: { condition: "overcast", description: "Nhiều mây", icon: "☁️", isRainy: false },
    45: { condition: "fog", description: "Sương mù", icon: "🌫️", isRainy: false },
    48: { condition: "fog", description: "Sương mù đóng băng", icon: "🌫️", isRainy: false },
    51: { condition: "drizzle", description: "Mưa phùn nhẹ", icon: "🌧️", isRainy: true },
    53: { condition: "drizzle", description: "Mưa phùn", icon: "🌧️", isRainy: true },
    55: { condition: "drizzle", description: "Mưa phùn dày", icon: "🌧️", isRainy: true },
    61: { condition: "rain", description: "Mưa nhẹ", icon: "🌧️", isRainy: true },
    63: { condition: "rain", description: "Mưa vừa", icon: "🌧️", isRainy: true },
    65: { condition: "rain", description: "Mưa to", icon: "🌧️", isRainy: true },
    66: { condition: "freezing_rain", description: "Mưa lạnh", icon: "🌨️", isRainy: true },
    67: { condition: "freezing_rain", description: "Mưa lạnh nặng", icon: "🌨️", isRainy: true },
    71: { condition: "snow", description: "Tuyết nhẹ", icon: "❄️", isRainy: false },
    73: { condition: "snow", description: "Tuyết vừa", icon: "❄️", isRainy: false },
    75: { condition: "snow", description: "Tuyết dày", icon: "❄️", isRainy: false },
    80: { condition: "rain_showers", description: "Mưa rào nhẹ", icon: "🌦️", isRainy: true },
    81: { condition: "rain_showers", description: "Mưa rào", icon: "🌦️", isRainy: true },
    82: { condition: "rain_showers", description: "Mưa rào mạnh", icon: "⛈️", isRainy: true },
    95: { condition: "thunderstorm", description: "Giông bão", icon: "⛈️", isRainy: true },
    96: { condition: "thunderstorm", description: "Giông bão kèm mưa đá", icon: "⛈️", isRainy: true },
    99: { condition: "thunderstorm", description: "Giông bão mạnh", icon: "⛈️", isRainy: true },
  };

  return weatherMap[code] || { 
    condition: "unknown", 
    description: "Không xác định", 
    icon: "🌡️", 
    isRainy: false 
  };
}

module.exports = router;
