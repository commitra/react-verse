/**
 * WEATHER DASHBOARD TODOs
 * -----------------------
 * Easy:
 * - [x] Extract API call into /src/services/weather.js and add caching
 * - [x] Add °C / °F toggle
 * - [x] Show weather icon (current + forecast)
 * - [x] Show feels-like temperature & wind speed
 * - [x] Add loading skeleton instead of plain text
 * - [x] Style forecast cards with condition color badges
 * Medium:
 * - [x] Dynamic background / gradient based on condition (sunny, rain, snow)
 * - [x] Input debounced search (on stop typing)
 * - [x] Persist last searched city (localStorage)
 * - [x] Add error retry button component
 * - [ ] Add favorites list (pin cities)
 * Advanced:
 * - [ ] Hourly forecast visualization (line / area chart)
 * - [x] Animate background transitions
 * - [ ] Add geolocation: auto-detect user city (with permission)
 */

import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Card from "../components/Card.jsx";
import Skeleton from "../components/Skeleton.jsx";
import {
  getWeatherData,
  clearWeatherCache,
  getCacheStats,
} from "../services/weather.js";

// Helper to determine weather background class
const weatherToClass = (desc = "") => {
  if (!desc) return "weather-bg-default";
  desc = desc.toLowerCase();
  if (desc.includes("rain") || desc.includes("shower") || desc.includes("drizzle"))
    return "weather-bg-rain";
  if (desc.includes("snow") || desc.includes("blizzard"))
    return "weather-bg-snow";
  if (desc.includes("cloud") || desc.includes("overcast"))
    return "weather-bg-cloud";
  if (desc.includes("sun") || desc.includes("clear") || desc.includes("fair"))
    return "weather-bg-sunny";
  if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze") || desc.includes("smoke"))
    return "weather-bg-fog";
  if (desc.includes("thunder") || desc.includes("storm"))
    return "weather-bg-storm";
  return "weather-bg-default";
};

// Render decorative weather animations
function renderWeatherAnimation(variant) {
  if (variant === "sunny") {
    return (
      <div className="sun-wrap">
        <div className="sun" />
      </div>
    );
  }

  if (variant === "cloud") {
    return (
      <>
        <svg className="cloud-svg cloud--left" viewBox="0 0 220 80" aria-hidden>
          <g filter="url(#cloudBlur)">
            <path className="cloud-shape" d="M20 50 C20 34 42 22 62 26 C70 16 92 12 110 22 C130 8 160 12 170 28 C196 30 206 44 190 54 L30 60 C22 60 20 54 20 50 Z" />
          </g>
          <defs>
            <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>
        </svg>
      </>
    );
  }

  if (variant === "rain") {
    return (
      <div className="rain-layer">
        {Array.from({ length: 12 }).map((_, i) => (
          <i
            key={i}
            className="raindrop"
            style={{
              left: `${(i / 12) * 100}%`,
              animationDelay: `${(i % 5) * 0.15}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "snow") {
    return (
      <div className="snow-layer snow-layer--back">
        {Array.from({ length: 12 }).map((_, i) => (
          <i
            key={`back-${i}`}
            className="snowflake"
            style={{
              left: `${(i / 12) * 100}%`,
              animationDelay: `${(i % 6) * 0.4}s`,
              "--dur": `${10 + (i % 6)}s`,
              "--drift": `${(i % 2 === 0 ? -40 : 40)}px`,
              width: `${8 + (i % 3) * 4}px`,
              height: `${8 + (i % 3) * 4}px`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "fog") {
    return (
      <>
        <div className="fog fog--one" />
        <div className="fog fog--two" />
      </>
    );
  }

  if (variant === "storm") {
    return (
      <div className="storm-layer">
        <div className="lightning lightning--primary" />
        <div className="lightning lightning--secondary" />
      </div>
    );
  }

  return null;
}

export default function Weather() {
  const [city, setCity] = useState(() => localStorage.getItem("lastCity") || "London");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C");
  const [activeBg, setActiveBg] = useState("default");
  const [prevBg, setPrevBg] = useState(null);

  useEffect(() => {
    fetchWeather(city);
  }, []);

  async function fetchWeather(c) {
    try {
      setLoading(true);
      setError(null);
      const json = await getWeatherData(c);
      setData(json);
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

  const handleClearCache = () => {
    clearWeatherCache();
    fetchWeather(city);
  };

  const handleShowCacheStats = () => {
    const stats = getCacheStats();
    alert(`Cache has ${stats.size} entries.`);
  };

  const current = data?.current_condition?.[0];
  const forecast = data?.weather?.slice(0, 3) || [];
  const desc = current?.weatherDesc?.[0]?.value || "";
  const weatherBg = weatherToClass(desc);
  const variant = weatherBg.replace("weather-bg-", "");

  useEffect(() => {
    if (activeBg !== variant) {
      setPrevBg(activeBg);
      setActiveBg(variant);
      const t = setTimeout(() => setPrevBg(null), 1000);
      return () => clearTimeout(t);
    }
  }, [variant, activeBg]);

  const displayTemp = (c) => (unit === "C" ? c : Math.round((c * 9) / 5 + 32));

  const getIconUrl = (icon) => {
    const url = Array.isArray(icon) ? icon[0]?.value : icon;
    if (!url) return null;
    return url.startsWith("//") ? `https:${url}` : url;
  };

  const getBadgeStyle = (condition) => {
    if (!condition) return { color: "#E0E0E0", label: "Clear 🌤️" };
    const d = condition.toLowerCase();
    if (d.includes("sun")) return { color: "#FFD54F", label: "Sunny ☀️" };
    if (d.includes("rain")) return { color: "#4FC3F7", label: "Rainy 🌧️" };
    if (d.includes("snow")) return { color: "#81D4FA", label: "Snowy ❄️" };
    if (d.includes("cloud")) return { color: "#B0BEC5", label: "Cloudy ☁️" };
    if (d.includes("storm")) return { color: "#9575CD", label: "Storm ⛈️" };
    return { color: "#E0E0E0", label: "Clear 🌤️" };
  };

  return (
    <div
      className="weather-page"
      style={{
        minHeight: "100vh",
        background: `var(--${activeBg}-gradient)`,
        transition: "background 1s ease-in-out",
        position: "relative",
      }}
    >
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        {renderWeatherAnimation(variant)}
      </div>

      <div className="weather-inner" style={{ position: "relative", zIndex: 10 }}>
        <h1>🌤️ Weather Dashboard</h1>

        <form onSubmit={handleSubmit} className="inline-form">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
          />
          <button type="submit">Fetch</button>
        </form>

        <div className="dev-tools">
          <button onClick={handleClearCache} className="dev-btn">
            Clear Cache
          </button>
          <button onClick={handleShowCacheStats} className="dev-btn">
            Cache Stats
          </button>
          <button
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
            className="dev-btn"
          >
            Switch to °{unit === "C" ? "F" : "C"}
          </button>
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
                <strong>Feels Like:</strong>{" "}
                {displayTemp(Number(current.FeelsLikeC))}°{unit}
              </p>
              <p>
                <strong>Wind Speed:</strong> {current.windspeedKmph} km/h
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

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "17px",
                    }}
                  >
                    <strong>Avg Temp:</strong>{" "}
                    {displayTemp(Number(day.avgtempC))}°{unit}
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

        {loading && (
          <div className="grid">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <Card key={i} title={<Skeleton width="80px" />}>
                  <Skeleton width="40px" />
                  <Skeleton width="60px" />
                  <Skeleton width="50px" />
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
