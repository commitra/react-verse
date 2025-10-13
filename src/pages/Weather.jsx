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

import { useEffect, useState } from "react";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Card from "../components/Card.jsx";
import Skeleton from "../components/Skeleton.jsx";

export default function Weather() {
  const [city, setCity] = useState("London");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C"); // °C by default

  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchWeather(c) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(c)}?format=j1`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const current = data?.current_condition?.[0];
  const forecast = data?.weather?.slice(0, 3) || [];

  // Helper to convert °C to °F
  const displayTemp = (c) => (unit === "C" ? c : Math.round((c * 9) / 5 + 32));

  return (
    <div>
      <h2>Weather Dashboard</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchWeather(city);
        }}
        className="inline-form"
        aria-label="City search form"
      >
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          aria-label="Enter city name"
        />
        <button type="submit" aria-label="Fetch weather">
          Fetch
        </button>
      </form>

      {/* Toggle button */}
      <div style={{ margin: "10px 0" }}>
        <button
          onClick={() => setUnit(unit === "C" ? "F" : "C")}
          aria-label={`Switch temperature unit to ${unit === "C" ? "Fahrenheit" : "Celsius"}`}
        >
          Switch to °{unit === "C" ? "F" : "C"}
        </button>
      </div>

      <ErrorMessage error={error} />

      <Card title={`Current in ${city}`} aria-label={`Current weather in ${city}`}>
        <div aria-label={loading ? "Temperature loading" : `Temperature: ${displayTemp(Number(current?.temp_C))}°${unit}`}>
          Temperature:{" "}
          {loading || !current?.temp_C ? <Skeleton height="12px" aria-label="Temperature loading" /> : `${displayTemp(Number(current.temp_C))}°${unit}`}
        </div>

        <div aria-label={loading ? "Humidity loading" : `Humidity: ${current?.humidity}%`}>
          Humidity:{" "}
          {loading || !current?.humidity ? <Skeleton height="12px" aria-label="Humidity loading" /> : `${current.humidity}%`}
        </div>

        <div aria-label={loading ? "Weather description loading" : `Description: ${current?.weatherDesc?.[0]?.value}`}>
          Desc:{" "}
          {loading || !current?.weatherDesc?.[0]?.value ? <Skeleton width="60px" height="12px" aria-label="Description loading" /> : current.weatherDesc[0].value}
        </div>
      </Card>

      <div className="grid" aria-label="Weather forecast grid">
        {(loading ? Array(3).fill({}) : forecast).map((day, index) => {
          const isSkeleton = loading || !day.avgtempC;
          return (
            <Card
              key={loading ? `skeleton-${index}` : day.date}
              title={loading ? <Skeleton width="120px" aria-label="Forecast date loading" /> : day.date}
              aria-label={loading ? "Forecast data loading" : `Forecast for ${day.date}`}
            >
              <div
                style={{ marginBottom: "1rem" }}
                aria-label={isSkeleton ? "Average temperature loading" : `Avg Temp: ${displayTemp(Number(day.avgtempC))}°${unit}`}
              >
                Avg Temp: {isSkeleton ? <Skeleton aria-label="Avg Temp loading" /> : `${displayTemp(Number(day.avgtempC))}°${unit}`}
              </div>

              <div
                aria-label={isSkeleton ? "Sunrise time loading" : `Sunrise: ${day.astronomy?.[0]?.sunrise}`}
              >
                Sunrise: {isSkeleton ? <Skeleton width="70px" aria-label="Sunrise loading" /> : day.astronomy?.[0]?.sunrise}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
