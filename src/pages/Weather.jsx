/**
 * WEATHER DASHBOARD TODOs
 * -----------------------
 * Easy:
 *  - [ ] Add °C / °F toggle
 *  - [ ] Show weather icon (current + forecast)
 *  - [ ] Show feels-like temperature & wind speed
 *  - [ ] Add loading skeleton instead of plain text
 *  - [ ] Style forecast cards with condition color badges
 * Medium:
 *  - [ ] Dynamic background / gradient based on condition (sunny, rain, snow)
 *  - [ ] Input debounced search (on stop typing)
 *  - [ ] Persist last searched city (localStorage)
 *  - [ ] Add error retry button component
 *  - [ ] Add favorites list (pin cities)
 * Advanced:
 *  - [ ] Hourly forecast visualization (line / area chart)
 *  - [ ] Animate background transitions
 *  - [ ] Add geolocation: auto-detect user city (with permission)
 *  - [ ] Extract API call into /src/services/weather.js and add caching
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';

export default function Weather() {
  const [city, setCity] = useState('London');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather(city);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchWeather(c) {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`https://wttr.in/${encodeURIComponent(c)}?format=j1`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const current = data?.current_condition?.[0];
  const forecast = data?.weather?.slice(0,3) || [];

  return (
    <div>
      <h2>Weather Dashboard</h2>
      <form onSubmit={e => { e.preventDefault(); fetchWeather(city); }} className="inline-form">
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" />
        <button type="submit">Fetch</button>
      </form>
      {loading && <Loading />}
      <ErrorMessage error={error} />
      {current && (
        <Card title={`Current in ${city}`}>          
          <p>Temperature: {current.temp_C}°C</p>
          <p>Humidity: {current.humidity}%</p>
          <p>Desc: {current.weatherDesc?.[0]?.value}</p>
          {/* TODO: Dynamic background based on weather condition */}
        </Card>
      )}
      <div className="grid">
        {forecast.map(day => (
          <Card key={day.date} title={day.date}>
            <p>Avg Temp: {day.avgtempC}°C</p>
            <p>Sunrise: {day.astronomy?.[0]?.sunrise}</p>
          </Card>
        ))}
      </div>
      {/* TODO: Add search history & favorites */}
    </div>
  );
}
