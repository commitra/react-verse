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
import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Card from "../components/Card.jsx";
import {
  getWeatherData,
  clearWeatherCache,
  getCacheStats,
} from "../services/weather.js";

export default function Weather() {
  const [city, setCity] = useState(() => {
    return localStorage.getItem("lastCity") || "London";
  });
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

      const json = await getWeatherData(c); // Using the service instead of direct fetch
      setData(json);

      // Save the searched city to localStorage
      localStorage.setItem("lastCity", c);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    fetchWeather(city);
  };

  // Helper function to clear cache and refetch (for testing)
  const handleClearCache = () => {
    clearWeatherCache();
    fetchWeather(city);
  };

  // Helper function to show cache stats (for development)
  const handleShowCacheStats = () => {
    const stats = getCacheStats();
    console.log("Cache Statistics:", stats);
    alert(`Cache has ${stats.size} entries. Check console for details.`);
  };

  const current = data?.current_condition?.[0];
  const forecast = data?.weather?.slice(0, 3) || [];

  // Helper to convert °C to °F
  const displayTemp = (c) => (unit === "C" ? c : Math.round((c * 9) / 5 + 32));

  // Normalize icon URL returned by wttr.in (they sometimes return // links)
  const getIconUrl = (iconArrOrStr) => {
    if (!iconArrOrStr) return null;

    // If API returned an array like [{ value: "//..." }]
    if (Array.isArray(iconArrOrStr)) {
      const url = iconArrOrStr?.[0]?.value;
      if (!url) return null;
      return url.startsWith("//") ? `https:${url}` : url;
    }

    // If API returned a plain string (rare) or already a URL
    if (typeof iconArrOrStr === "string") {
      return iconArrOrStr.startsWith("//")
        ? `https:${iconArrOrStr}`
        : iconArrOrStr;
    }

    return null;
  };

  // Format wttr.in hourly time values like "0", "300", "1500" -> "00:00", "03:00", "15:00"
  const formatWttTime = (t) => {
    if (t == null) return "";
    const s = String(t).padStart(4, "0");
    return `${s.slice(0, 2)}:${s.slice(2)}`;
  };

  const getBadgeStyle = (condition) => {
    if (!condition) return { color: "#E0E0E0", label: "Clear 🌤️" };

    const desc = condition.toLowerCase();
    if (desc.includes("sun")) return { color: "#FFD54F", label: "Sunny ☀️" };
    if (desc.includes("rain")) return { color: "#4FC3F7", label: "Rainy 🌧️" };
    if (desc.includes("snow")) return { color: "#81D4FA", label: "Snowy ❄️" };
    if (desc.includes("cloud")) return { color: "#B0BEC5", label: "Cloudy ☁️" };
    if (desc.includes("storm") || desc.includes("thunder"))
      return { color: "#9575CD", label: "Storm ⛈️" };
    return { color: "#E0E0E0", label: "Clear 🌤️" };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>🌤️ Weather Dashboard</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
          />
          <button type="submit">Get Weather</button>
        </form>

        {/* Development tools - you can remove these later */}
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button onClick={handleClearCache} style={{ fontSize: "12px" }}>
            Clear Cache
          </button>
          <button onClick={handleShowCacheStats} style={{ fontSize: "12px" }}>
            Cache Stats
          </button>
          <button
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
            style={{ fontSize: "12px" }}
          >
            Switch to °{unit === "C" ? "F" : "C"}
          </button>
        </div>
      </div>

      {loading && <Loading />}
      {error && (
        <ErrorMessage
          message={error.message}
          onRetry={() => fetchWeather(city)}
        />
      )}

      {data && !loading && (
        <div className="dashboard-grid">
          {/* Current Weather */}
          <Card title="Current Weather" size="large">
            <h2>{data.nearest_area?.[0]?.areaName?.[0]?.value || city}</h2>
            <p style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {current && getIconUrl(current.weatherIconUrl) && (
                <img
                  src={getIconUrl(current.weatherIconUrl)}
                  alt={current.weatherDesc?.[0]?.value || "weather icon"}
                  style={{ width: 48, height: 48, objectFit: "contain" }}
                />
              )}
              <span>
                <strong>Temperature:</strong>{" "}
                {displayTemp(Number(current.temp_C))}°{unit}
              </span>
            </p>
            <p>
              <strong>Humidity:</strong> {current.humidity}%
            </p>
            <p>
              <strong>Desc:</strong> {current.weatherDesc?.[0]?.value}
            </p>
          </Card>

          {/* 3-Day Forecast */}
          {forecast.map((day, i) => {
            const condition =
              day.hourly?.[0]?.weatherDesc?.[0]?.value || "Clear";
            const badge = getBadgeStyle(condition);

            return (
              <Card key={i} title={i === 0 ? "Today" : `Day ${i + 1}`}>
                {/* Badge Section */}
                {/* Forecast icon (use first hourly entry icon) */}
                {day.hourly?.[0] &&
                  getIconUrl(day.hourly?.[0]?.weatherIconUrl) && (
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={getIconUrl(day.hourly?.[0]?.weatherIconUrl)}
                        alt={
                          day.hourly?.[0]?.weatherDesc?.[0]?.value ||
                          "forecast icon"
                        }
                        style={{ width: 40, height: 40, objectFit: "contain" }}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}

                {/* Full-day hourly timeline (0:00 - 23:00) */}
                {day.hourly && (
                  <div
                    style={{
                      display: "block",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        overflowX: "auto",
                        padding: "8px 4px",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      {day.hourly.map((h, idx) => {
                        const icon = getIconUrl(h.weatherIconUrl);
                        const t = h.time ?? h.Time ?? "";
                        const temp =
                          h.tempC ?? h.temp_C ?? h.tempC ?? h.tempF ?? "";

                        return (
                          <div
                            key={idx}
                            style={{
                              minWidth: 72,
                              padding: 6,
                              borderRadius: 6,
                              background: "rgba(0,0,0,0.03)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                            }}
                          >
                            {icon ? (
                              <img
                                src={icon}
                                alt={h.weatherDesc?.[0]?.value || "hour icon"}
                                style={{
                                  width: 36,
                                  height: 36,
                                  objectFit: "contain",
                                }}
                                loading="lazy"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            ) : (
                              <div style={{ fontSize: 18 }}>🌤️</div>
                            )}
                            <div style={{ marginTop: 6 }}>
                              {formatWttTime(t)}
                            </div>
                            <div style={{ fontWeight: 700 }}>
                              {displayTemp(Number(temp))}°{unit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={
                  {display:"flex",gap:"8px", marginTop:"17px"}
                }>
                  <strong>Avg Temp:</strong> {displayTemp(Number(day.avgtempC))}
                  °{unit}
                  <div
                  style={{
                    backgroundColor: badge.color,
                    borderRadius: "8px",
                    padding: "4px 8px",
                    display: "inline-block",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  {badge.label}
                </div>
                </div>
                <p>
                  <strong>Sunrise:</strong> {day.astronomy?.[0]?.sunrise}
                </p>
                <p>
                  <strong>Sunset:</strong> {day.astronomy?.[0]?.sunset}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
