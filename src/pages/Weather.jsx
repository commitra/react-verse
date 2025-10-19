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
 * - [x] Dynamic background / gradient based on condition (sunny, rain, snow)
 * - [x] Input debounced search (on stop typing)
 * - [x] Persist last searched city (localStorage)
 * - [x] Add error retry button component
 * - [ ] Add favorites list (pin cities)
 * - [x] Optimize API usage by adding debounced search delay
 * Advanced:
 *  - [ ] Hourly forecast visualization (line / area chart)
 *  - [ ] Animate background transitions
 *  - [ ] Add geolocation: auto-detect user city (with permission)
 *  - [ ] Extract API call into /src/services/weather.js and add caching
 */

import { useEffect, useState, useRef } from "react";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Card from "../components/Card.jsx";
import Skeleton from "../components/Skeleton.jsx";
import HeroSection from "../components/HeroSection";
import Cloud from "../Images/Cloud.jpg";
import {
  getWeatherData,
  clearWeatherCache,
  getCacheStats,
} from "../services/weather.js";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoMdHeart } from "react-icons/io";
import SprinkleEffect from "../components/SprinkleEffect.jsx";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C"); // °C by default
  const [activeBg, setActiveBg] = useState("default");
  const [prevBg, setPrevBg] = useState(null);
  const [isLocAllowed, setIsLocAllowed] = useState(null);
  const [isRequestingLoc, setIsRequestingLoc] = useState(false);
  const [trigger, setTrigger] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    const storedCity = localStorage.getItem("userLocation");
    if (storedCity) {
      setIsLocAllowed(true);
      setCity(JSON.parse(storedCity));
    } else if (navigator.geolocation) {
      requestLocation();
    } else {
      setIsLocAllowed(false);
      setError(
        "Your browser does not support location detection. Please enter city manually."
      );
      setCity("London");
    }
  }, []);

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  async function getCurrentCity(lat, lon) {
    const APIkey = import.meta.env.VITE_WEATHER_API_KEY;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${APIkey}`
      );
      const data = await res.json();
      if (data && data.length > 0 && data[0].name) {
        setCity(data[0].name);
        setError(null);
        setIsLocAllowed(true);
        localStorage.setItem("userLocation", JSON.stringify(data[0].name));
      } else {
        setCity("London");
        setError("Could not detect city from location.");
        setIsLocAllowed(false);
      }
    } catch (err) {
      console.log(err);
      setCity("London");
      setError(err.message);
      setIsLocAllowed(false);
    }
  }

  function requestLocation() {
    setIsRequestingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async function onSuccess(position) {
        await getCurrentCity(
          position.coords.latitude,
          position.coords.longitude
        );
        setIsRequestingLoc(false);
      },

      function onError(err) {
        console.log("Error", err);
        setIsLocAllowed(false);
        setError(
          "Location is blocked. Please enable location in your browser settings to detect automatically."
        );
        setCity("London");
        setIsRequestingLoc(false);
      }
    );
  }

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
          <HeroSection
            image={Cloud}
            title={
              <>
                Weather <span style={{ color: "black" }}>Wonders</span>
              </>
            }
            subtitle="Stay ahead of the weather with real-time updates and accurate forecasts tailored just for you"
          />
          <svg
            className="cloud-svg cloud--left"
            viewBox="0 0 220 80"
            aria-hidden
          >
            <g filter="url(#cloudBlur)">
              <path
                className="cloud-shape"
                d="M20 50 C20 34 42 22 62 26 C70 16 92 12 110 22 C130 8 160 12 170 28 C196 30 206 44 190 54 L30 60 C22 60 20 54 20 50 Z"
              />
            </g>
            <defs>
              <filter
                id="cloudBlur"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
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
                "--drift": `${i % 2 === 0 ? -40 : 40}px`,
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

  // ✅ Debounced search effect
  useEffect(() => {
    if (!city.trim()) return;
    const handler = setTimeout(() => {
      fetchWeather(city);
    }, 800); // delay in ms
    return () => clearTimeout(handler);
  }, [city]);

  async function fetchWeather(c) {
    try {
      setLoading(true);
      setError(null);

      // Try using optional service helper first (if exported)
      let json = null;
      if (typeof getWeatherData === "function") {
        try {
          json = await getWeatherData(c);
        } catch (e) {
          // if service fails, we'll fallback to wttr.in below
          json = null;
        }
      }

      // Fallback to wttr.in if no json from service
      if (!json) {
        const res = await fetch(
          `https://wttr.in/${encodeURIComponent(c)}?format=j1`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        json = await res.json();
      }

      setData(json);
      localStorage.setItem("lastCity", c);
    } catch (e) {
      setError(e?.message || String(e));
      setData(null);
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

  useEffect(() => {
    setFavourites(JSON.parse(localStorage.getItem("favourites")) || []);
  }, []);

  // handle add to favourite
  const handleAddToFav = () => {
    const rect = btnRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Set trigger
    setTrigger({ x, y });

    // Reset trigger after a short delay to prevent unwanted reruns
    setTimeout(() => setTrigger(null), 50);

    let updatedFav;
    const formattedCity = formatCityName(city);
    const isFav = favourites.some(
      (c) => c.toLowerCase() === city.toLowerCase()
    );
    updatedFav = isFav
      ? favourites.filter((item) => item.toLowerCase() !== city.toLowerCase())
      : [...favourites, formattedCity];

    setFavourites(updatedFav);
    localStorage.setItem("favourites", JSON.stringify(updatedFav));
  };

  const isFav = favourites.some((c) => c.toLowerCase() === city.toLowerCase());

  function formatCityName(str) {
    return str
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <div
      className="weather-page"
      style={{
        minHeight: "100vh",
        background: `var(--${activeBg}-gradient)`,
        transition: "background 1s ease-in-out",
        position: "relative",
        marginTop: "45vh",
      }}
    >
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        {renderWeatherAnimation(variant)}
      </div>

      <div
        className="weather-inner"
        style={{ position: "relative", zIndex: 10 }}
      >
        <h1>🌤️ Weather Dashboard</h1>

        <form onSubmit={handleSubmit} className="inline-form">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
          />
          <button type="submit" disabled={isRequestingLoc}>
            Fetch
          </button>
          <button
            type="button"
            disabled={isRequestingLoc}
            onClick={() => requestLocation()}
          >
            {isLocAllowed
              ? isRequestingLoc
                ? "Updating..."
                : "Update location"
              : isRequestingLoc
              ? "Detecting..."
              : "Detect my location"}
          </button>
        </form>

        <div className="dev-tools" style={{ position: "relative" }}>
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
          <button
            className="dev-btn"
            onClick={() => setShowFavourites((prev) => !prev)}
          >
            {showFavourites ? "Hide Favourites" : " See Favourites"}
          </button>
          {showFavourites && (
            <div className="favourites-dropdown">
              <select
                value=""
                onChange={(e) => {
                  fetchWeather(e.target.value);
                  setCity(e.target.value);
                  setShowFavourites(false);
                }}
              >
                <option value="" disabled>
                  Select a favourite
                </option>
                {favourites.map((fav, i) => (
                  <option
                    className="favourites-option"
                    value={formatCityName(fav)}
                    key={formatCityName(fav)}
                  >
                    {formatCityName(fav)}
                  </option>
                ))}
              </select>
            </div>
          )}
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
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}
              >
                <h2>{data.nearest_area?.[0]?.areaName?.[0]?.value || city}</h2>
                <div
                  className="fav-icon"
                  ref={btnRef}
                  onClick={handleAddToFav}
                  title={isFav ? "Remove from favourites" : "Add to favourites"}
                >
                  {isFav ? (
                    <IoMdHeart size={18} color="#b22222" />
                  ) : (
                    <IoMdHeartEmpty size={18} color="#b22222" />
                  )}
                </div>
                <SprinkleEffect trigger={trigger} />
              </div>

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
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "contain",
                          }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    )}

                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "17px" }}
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
