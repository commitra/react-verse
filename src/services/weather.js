// src/services/weather.js

// Simple in-memory cache
const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Fetches weather data for a given city with caching
 * @param {string} city - The city name to fetch weather for
 * @returns {Promise<Object>} Weather data from wttr.in API
 */
export const getWeatherData = async (city) => {
  const cacheKey = city.toLowerCase();
  const now = Date.now();
  
  // Check if we have cached data that's still valid
  if (weatherCache.has(cacheKey)) {
    const cachedData = weatherCache.get(cacheKey);
    if (now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    } else {
      // Remove expired cache entry
      weatherCache.delete(cacheKey);
    }
  }

  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch');
    }
    
    const json = await res.json();
    
    // Cache the successful response
    weatherCache.set(cacheKey, {
      data: json,
      timestamp: now
    });
    
    return json;
  } catch (error) {
    throw error; // Re-throw to maintain existing error handling
  }
};

/**
 * Clears the weather cache
 */
export const clearWeatherCache = () => {
  weatherCache.clear();
};

/**
 * Gets cache statistics for debugging
 */
export const getCacheStats = () => {
  return {
    size: weatherCache.size,
    entries: Array.from(weatherCache.keys())
  };
};
