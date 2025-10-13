/**
 * SPACE & ASTRONOMY DASHBOARD TODOs
 * ---------------------------------
 * Easy:
 *  - [x] Refresh button / auto-refresh interval selector
 *  - [ ] Show last updated timestamp
 *  - [ ] Style astronauts list with craft grouping
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

export default function Space() {
  const [iss, setIss] = useState(null);
  const [crew, setCrew] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
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
  
  //leaflet map component
  return (
    <div>
      <h2>Space & Astronomy</h2>
      <DashboardControls onRefresh={fetchData} />
      {loading && <Loading />}
      <ErrorMessage error={error} />
      {iss && (
        <Card title="ISS Current Location">
          <p>Latitude: {iss.iss_position.latitude}</p>
          <p>Longitude: {iss.iss_position.longitude}</p>
          {lastUpdated && (
            <p style={{ fontSize: '0.8rem', color: '#666' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <IssMap latitude={iss.iss_position.latitude} longitude={iss.iss_position.longitude} />
        </Card>
      )}
      <Card title={`Astronauts in Space (${crew.length})`}>
        <ul>
          {crew.map(p => (
            <li key={p.name}>{p.name} — {p.craft}</li>
          ))}
        </ul>
      </Card>
      {/* TODO: Add next ISS pass prediction form */}
    </div>
  );
}
