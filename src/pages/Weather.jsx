/**
 * WEATHER DASHBOARD TODOs
 * -----------------------
 * Easy:
 * - [x] Extract API call into /src/services/weather.js and add caching
 * - [ ] Add °C / °F toggle
 * - [ ] Show weather icon (current + forecast)
 * - [ ] Show feels-like temperature & wind speed
 * - [ ] Add loading skeleton instead of plain text
 * - [ ] Style forecast cards with condition color badges
 * Medium:
 * - [ ] Dynamic background / gradient based on condition (sunny, rain, snow)
 * - [ ] Input debounced search (on stop typing)
 * - [ ] Persist last searched city (localStorage)
 * - [ ] Add error retry button component
 * - [ ] Add favorites list (pin cities)
 * Advanced:
 * - [ ] Hourly forecast visualization (line / area chart)
 * - [ ] Animate background transitions
 * - [ ] Add geolocation: auto-detect user city (with permission)
 */

import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';
import { getWeatherData, clearWeatherCache, getCacheStats } from '../services/weather.js';

export default function Weather() {
  const [city, setCity] = useState('London');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C'); // °C by default

  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchWeather(c) {
    try {
      setLoading(true);
      setError(null);
      const json = await getWeatherData(c); // Using the service instead of direct fetch
      setData(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to clear cache and refetch (for testing)
  const handleClearCache = () => {
    clearWeatherCache();
    fetchWeather(city);
  };

  // Helper function to show cache stats (for development)
  const handleShowCacheStats = () => {
    const stats = getCacheStats();
    console.log('Cache Statistics:', stats);
    alert(`Cache has ${stats.size} entries. Check console for details.`);
  };

  const current = data?.current_condition?.[0];
  const forecast = data?.weather?.slice(0,3) || [];

  // Helper to convert °C to °F
  const displayTemp = (c) => unit === 'C' ? c : Math.round((c * 9/5) + 32);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>🌤️ Weather Dashboard</h1>
        <form onSubmit={(e) => {e.preventDefault(); fetchWeather(city)}}>
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..." 
          />
          <button type="submit">Get Weather</button>
        </form>
        
        {/* Development tools - you can remove these later */}
        <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
          <button onClick={handleClearCache} style={{fontSize: '12px'}}>
            Clear Cache
          </button>
          <button onClick={handleShowCacheStats} style={{fontSize: '12px'}}>
            Cache Stats
          </button>
          <button onClick={() => setUnit(unit === 'C' ? 'F' : 'C')} style={{fontSize: '12px'}}>
            Switch to °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>
      </div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error.message} onRetry={() => fetchWeather(city)} />}

      {data && !loading && (
        <div className="dashboard-grid">
          {/* Current Weather */}
          <Card title="Current Weather" size="large">
            <h2>{data.nearest_area?.[0]?.areaName?.[0]?.value || city}</h2>
            <p><strong>Temperature:</strong> {displayTemp(Number(current.temp_C))}°{unit}</p>
            <p><strong>Humidity:</strong> {current.humidity}%</p>
            <p><strong>Desc:</strong> {current.weatherDesc?.[0]?.value}</p>
          </Card>

          {/* 3-Day Forecast */}
          {forecast.map((day, i) => (
            <Card key={i} title={i === 0 ? 'Today' : `Day ${i+1}`}>
              <p><strong>Avg Temp:</strong> {displayTemp(Number(day.avgtempC))}°{unit}</p>
              <p><strong>Sunrise:</strong> {day.astronomy?.[0]?.sunrise}</p>
              <p><strong>Sunset:</strong> {day.astronomy?.[0]?.sunset}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
