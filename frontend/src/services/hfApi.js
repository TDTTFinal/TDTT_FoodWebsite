/**
 * HuggingFace API Service for Food Tour Suggestions
 * Endpoint: https://nemo-chewz.hf.space/api/v2/search/
 */

const HF_API_BASE = 'https://nemo-chewz.hf.space/api/v2';

/**
 * Fetch food tour suggestions from HuggingFace API
 * @param {Object} params - Query parameters
 * @param {string} params.q - Natural language query (e.g., "Cơm tấm rồi cà phê")
 * @param {number} params.lat - Latitude
 * @param {number} params.lon - Longitude
 * @param {number} [params.radius=5] - Search radius in km
 * @param {number} [params.alpha=0.6] - Semantic vs TF-IDF weight (0-1)
 * @param {number} [params.top_k=5] - Number of candidates per step
 * @returns {Promise<Object>} Response with steps and suggested_routes
 */
export const fetchFoodTourSuggestions = async ({ q, lat, lon, radius = 5, alpha = 0.6, top_k = 5 }) => {
  if (!q || !lat || !lon) {
    throw new Error('Query (q), latitude (lat), and longitude (lon) are required');
  }

  const url = new URL(`${HF_API_BASE}/search/`);
  url.searchParams.append('q', q);
  url.searchParams.append('lat', lat.toString());
  url.searchParams.append('lon', lon.toString());
  url.searchParams.append('radius', radius.toString());
  url.searchParams.append('alpha', alpha.toString());
  url.searchParams.append('top_k', top_k.toString());
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HuggingFace API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[HF API] Error fetching suggestions:', error);
    throw error;
  }
};

export default { fetchFoodTourSuggestions };
