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
 * - [x] Animate background transitions
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

// Helper to determine weather background class
const weatherToClass = (desc = "") => {
  if (!desc) return "weather-bg-default";
  desc = desc.toLowerCase();
  if (
    desc.includes("rain") ||
    desc.includes("shower") ||
    desc.includes("drizzle")
  )
    return "weather-bg-rain";
  if (desc.includes("snow") || desc.includes("blizzard"))
    return "weather-bg-snow";
  if (desc.includes("cloud") || desc.includes("overcast"))
    return "weather-bg-cloud";
  if (desc.includes("sun") || desc.includes("clear") || desc.includes("fair"))
    return "weather-bg-sunny";
  if (
    desc.includes("fog") ||
    desc.includes("mist") ||
    desc.includes("haze") ||
    desc.includes("smoke")
  )
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
        {/* Inline SVG cloud instances for predictable lobe placement */}
        <svg className="cloud-svg cloud--left" viewBox="0 0 220 80" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <g filter="url(#cloudBlur)">
            <path className="cloud-shape" d="M20 50 C20 34 42 22 62 26 C70 16 92 12 110 22 C130 8 160 12 170 28 C196 30 206 44 190 54 L30 60 C22 60 20 54 20 50 Z" />
          </g>
          <defs>
            <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            </filter>
          </defs>
        </svg>

        <svg className="cloud-svg cloud--mid" viewBox="0 0 260 90" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <g filter="url(#cloudBlurMid)">
            <path className="cloud-shape" d="M30 60 C30 38 60 24 90 30 C100 18 126 12 150 28 C175 14 210 18 228 36 C248 40 250 56 230 68 L40 74 C32 74 30 68 30 60 Z" />
          </g>
          <defs>
            <filter id="cloudBlurMid" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="blur" />
            </filter>
          </defs>
        </svg>

        <svg className="cloud-svg cloud--right" viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <g filter="url(#cloudBlurSmall)">
            <path className="cloud-shape" d="M18 42 C18 30 38 22 60 24 C68 14 92 10 112 20 C136 10 160 14 168 28 C186 30 190 42 172 52 L34 54 C28 54 20 48 18 42 Z" />
          </g>
          <defs>
            <filter id="cloudBlurSmall" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            </filter>
          </defs>
        </svg>

        {/* fewer clouds: keep three main clouds (left, mid, right) for a cleaner scene */}
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
    // two layered snow fields: back (larger, slower) + front (smaller, faster)
    return (
      <>
        <div className="snow-layer snow-layer--back">
          {Array.from({ length: 12 }).map((_, i) => (
            <i
              key={`back-${i}`}
              className="snowflake"
              style={{
                left: `${(i / 12) * 100}%`,
                animationDelay: `${(i % 6) * 0.4}s`,
                // duration and horizontal drift vary per-flake
                '--dur': `${10 + (i % 6)}s`,
                '--drift': `${(i % 2 === 0 ? -40 : 40)}px`,
                width: `${8 + (i % 3) * 4}px`,
                height: `${8 + (i % 3) * 4}px`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>

        <div className="snow-layer snow-layer--front">
          {Array.from({ length: 16 }).map((_, i) => (
            <i
              key={`front-${i}`}
              className="snowflake"
              style={{
                left: `${(i / 16) * 100}%`,
                animationDelay: `${(i % 5) * 0.15}s`,
                '--dur': `${6 + (i % 5)}s`,
                '--drift': `${(i % 3 === 0 ? -24 : 24)}px`,
                width: `${6 + (i % 2) * 3}px`,
                height: `${6 + (i % 2) * 3}px`,
                opacity: 0.98,
              }}
            />
          ))}
        </div>
      </>
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
        {/* Multiple lightning bolts with different positions and timings */}
        <div className="lightning lightning--primary" />
        <div className="lightning lightning--secondary" />
        <div className="lightning lightning--tertiary" />
        <div className="lightning lightning--quick" />
        <div className="lightning lightning--distant" />
        {Array.from({ length: 8 }).map((_, i) => (
          <i
            key={i}
            className="raindrop storm-rain"
            style={{
              left: `${(i / 8) * 100}%`,
              animationDelay: `${(i % 4) * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

    // Default: subtle particle shimmer
  return (
    <>
      <div className="ambient-shimmer" />
      <div className="floating-particles">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${15 + i * 12}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

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
    const desc = current?.weatherDesc?.[0]?.value || "";
  const weatherBg = weatherToClass(desc);
  const weatherVariant = weatherBg.replace("weather-bg-", "");

  // Track active and previous background variants for smooth crossfade transitions
  const [activeBg, setActiveBg] = useState("default");
  const [prevBg, setPrevBg] = useState(null);

  useEffect(() => {
    if (activeBg === weatherVariant) return;
    // When variant changes, keep previous so we can crossfade
    setPrevBg(activeBg);
    setActiveBg(weatherVariant);
    // Clear previous after the CSS transition finishes
    const timer = setTimeout(() => setPrevBg(null), 1000);
    return () => clearTimeout(timer);
  }, [weatherVariant, activeBg]);

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

  const getWeatherBackground = (variant) => {
    switch (variant) {
      case "sunny":
        return "linear-gradient(135deg, #e6f7ff 0%, #cdeeff 50%, #a6ddff 100%)";
      case "rain":
        return "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 50%, #34495e 100%)";
      case "cloud":
        return "linear-gradient(135deg, #ece9e6 0%, #ffffff 50%, #f8f9fa 100%)";
      case "snow":
        return "linear-gradient(135deg, #e0eafc 0%, #cfdef3 50%, #a8c0ff 100%)";
      case "fog":
        return "linear-gradient(135deg, #bdc3c7 0%, #757f9a 50%, #5c6b8a 100%)";
      case "storm":
        return "linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #1a252f 100%)";
      default:
        return "linear-gradient(135deg, #89f7fe 0%, #66a6ff 50%, #4facfe 100%)";
    }
  };

  return (
    <div
      className="dashboard-page weather-page"
      style={{
        minHeight: "100vh",
        position: "relative",
        background: getWeatherBackground(activeBg),
        transition: "background 1s ease-in-out",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "visible",
        }}
      >
        {renderWeatherAnimation(weatherVariant)}
      </div>

      <div className="weather-inner">
        <div
            className="dashboard-header"
            style={{ position: "relative", zIndex: 10 }}
          >
          <h1>🌤️ Weather Dashboard</h1>
          <form onSubmit={handleSubmit} className="weather-form">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="weather-input"
            />
            <button type="submit" className="weather-btn">
              Get Weather
            </button>
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
    </div>
  );
}
