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
import HeroSection from '../components/HeroSection';
import SpaceImg from '../Images/Space.jpg';


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
    
    // Add a small delay between requests to avoid rate limiting
    const issRes = await fetch('/api/iss-now.json');
    if (!issRes.ok) throw new Error('Failed to fetch ISS position');
    const issJson = await issRes.json();
    
    // Wait 500ms before the second request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const crewRes = await fetch('/api/astros.json');
    if (!crewRes.ok) throw new Error('Failed to fetch crew data');
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
  let isMounted = true;
  const controller = new AbortController();

  const loadData = async () => {
    if (isMounted) {
      await fetchData();
    }
  };

  loadData();

  return () => {
    isMounted = false;
    controller.abort();
  };
}, []);


  // Proper dark/light theme colors
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const subText = isDark ? '#94a3b8' : '#64748b';
  const accent = isDark ? '#38bdf8' : '#2563eb';
  const listBg = isDark ? '#334155' : '#f1f5f9';
  const borderColor = isDark ? '#334155' : '#e2e8f0';

  const groupedCrew = crew.reduce((acc, p) => {
  if (!acc[p.craft]) acc[p.craft] = [];
  acc[p.craft].push(p);
  return acc;
}, {});

  return (
    <>
    <HeroSection
  image={SpaceImg}
    title={
    <>
      Orbiting Earth, <span style={{ color: 'purple' }}>Sharing Stories</span>
    </>
  }
  subtitle="Track the International Space Station and dive into the lives of its courageous crew"
/>
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
          marginBottom: '0.8rem',
          fontSize: '2rem',
          fontWeight: '600',
          color: accent,
          letterSpacing: '0.5px',
        }}
      >
        🌌 Space & Astronomy Dashboard
      </h2>

      {lastUpdated && (
        <p
          style={{
            textAlign: 'center',
            color: subText,
            fontSize: '0.95rem',
            marginBottom: '1.2rem',
          }}
        >
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           {Object.entries(groupedCrew).map(([craft, members]) => (
            <div key={craft} style={{ border: `1px solid ${borderColor}`, borderRadius: '8px', padding: '1rem', backgroundColor: listBg }}>
               <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: accent }}>
              🚀 {craft} ({members.length})
               </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {members.map((p) => (
              <li key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: isDark ? '#475569' : '#e2e8f0' }}>
              <span style={{ fontWeight: '500', color: textColor }}>{p.name}</span>
              </li>
            ))}
            </ul>
            </div>
            ))}
          </div>

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
          onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
        >
          Open Notify API
        </a>
      </p>
    </div>
    </>
  );
}