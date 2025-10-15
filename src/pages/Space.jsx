/**
 * SPACE & ASTRONOMY DASHBOARD TODOs
 * ---------------------------------
 * Easy:
 *  - [x] Refresh button / auto-refresh interval selector
 *  - [x] Show last updated timestamp
 *  - [x] Style astronauts list with craft grouping
 *  - [ ] Add loading skeleton or placeholder map area
 * Medium:
 *  - [ ] Integrate Leaflet map w/ marker at ISS coords
 *  - [ ] Auto-update ISS position every 5s (clear on unmount)
 *  - [ ] Add altitude & velocity via alternative API (research any free source)
 *  - [ ] Collapsible section for astronaut bios (stub) / link to Wikipedia
 * Advanced:
 *  - [ ] ISS pass predictor: user enters lat/lon; call pass API & list times
 *  - [ ] WebSocket or repeated polling abstraction hook
 *  - [ ] Track path trail (polyline) on map over session
 *  - [ ] Extract map component & custom hook (useIssPosition)
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';
import IssMap from '../components/IssMap.jsx';
import DashboardControls from "../components/DashboardControls.jsx";


export default function Space({ theme = 'light' }) {
  const [iss, setIss] = useState(null);
  const [crew, setCrew] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isDark = theme === 'dark';

  // Fetch both ISS position + crew
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [issRes, crewRes] = await Promise.all([
        fetch('http://api.open-notify.org/iss-now.json'),
        fetch('http://api.open-notify.org/astros.json')
      ]);
      if (!issRes.ok || !crewRes.ok) throw new Error('Failed to fetch');
      const issJson = await issRes.json();
      const crewJson = await crewRes.json();
      setIss(issJson);
      setCrew(crewJson.people || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Proper dark/light theme colors
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const subText = isDark ? '#94a3b8' : '#64748b';
  const accent = isDark ? '#38bdf8' : '#2563eb';
  const listBg = isDark ? '#334155' : '#f1f5f9';
  const borderColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: bgColor,
        borderRadius: '16px',
        boxShadow: isDark
          ? '0 4px 10px rgba(0,0,0,0.3)'
          : '0 4px 10px rgba(0,0,0,0.08)',
        color: textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        border: isDark ? '1px solid #334155' : 'none',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '1.8rem',
          fontSize: '2rem',
          fontWeight: '600',
          color: accent,
          letterSpacing: '0.5px',
        }}
      >
        🌌 Space & Astronomy Dashboard
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <DashboardControls onRefresh={fetchData} />
      </div>

      {loading && <Loading />}
      <ErrorMessage error={error} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          justifyContent: 'center',
        }}
      >
        {iss && (
          <Card
            title="🛰️ ISS Current Location"
            style={{
              backgroundColor: cardBg,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.2)'
                : '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              border: `1px solid ${borderColor}`,
            }}
          >
            <div style={{ lineHeight: '1.6' }}>
              <p style={{ color: textColor, margin: '0.5rem 0' }}>
                <strong>Latitude:</strong> {iss.iss_position.latitude}
              </p>
              <p style={{ color: textColor, margin: '0.5rem 0' }}>
                <strong>Longitude:</strong> {iss.iss_position.longitude}
              </p>
              {lastUpdated && (
                <p style={{ fontSize: '0.9rem', color: subText, margin: '0.5rem 0' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <IssMap
                latitude={iss.iss_position.latitude}
                longitude={iss.iss_position.longitude}
              />
            </div>
          </Card>
        )}

        <Card
          title={`👩‍🚀 Astronauts in Space (${crew.length})`}
          style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.2)'
              : '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            border: `1px solid ${borderColor}`,
          }}
        >
          <ul style={{ 
            paddingLeft: '0', 
            listStyleType: 'none', 
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {crew.map((p) => (
              <li
                key={p.name}
                style={{
                  backgroundColor: listBg,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${borderColor}`,
                }}
              >
                <span style={{ 
                  fontWeight: '500', 
                  color: textColor 
                }}>
                  {p.name}
                </span>
                <span style={{ 
                  fontSize: '0.9rem', 
                  color: subText,
                  backgroundColor: isDark ? '#475569' : '#e2e8f0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}>
                  🚀 {p.craft}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: subText,
        }}
      >
        Data sourced from{' '}
        <a
          href="http://api.open-notify.org"
          style={{
            color: accent,
            textDecoration: 'none',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          Open Notify API
        </a>
      </p>
    </div>
  );
}