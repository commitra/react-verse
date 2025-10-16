/**
 * COVID-19 DASHBOARD TODOs
 * ------------------------
 * Easy:
 *  - [ ] Show date of summary data (API provides Date field)
 *  - [ ] Format numbers with abbreviation utility
 *  - [ ] Add refresh button
 *  - [ ] Add note/link about data source & potential delays
 * Medium:
 *  - [ ] Country search input (filter dropdown)
 *  - [ ] Sort countries (Total Confirmed, New Confirmed, Deaths)
 *  - [ ] Persist last selected country
 *  - [ ] Basic trend chart (cases over time) for selected country
 * Advanced:
 *  - [ ] Multi-country comparison chart
 *  - [ ] Data normalization per million population (needs population API)
 *  - [ ] Offline cache last fetch
 *  - [ ] Extract service + hook (useCovidSummary, useCountryTrends)
 */
import { useEffect, useState, useCallback } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';
import CountryTrendChart from '../components/CountryTrendChart.jsx';

export default function Covid() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('');

  const fetchSummary = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true); 
      setError(null);
      const res = await fetch('https://api.covid19api.com/summary');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setSummary(json);
    } catch (e) { 
      setError(e); 
    } finally { 
      setLoading(false); 
    }
  }, [loading]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const global = summary?.Global;
  const countries = summary?.Countries || [];
  const selected = countries.find(c => c.Slug === country);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <h2>COVID-19 Tracker</h2>
      <button onClick={fetchSummary} disabled={loading}>
    {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
      {loading && !summary && <Loading />}
      <ErrorMessage error={error} />
      {global && (
        <Card title="Global Stats">
          <p>New Confirmed: {global.NewConfirmed.toLocaleString()}</p>
          <p>Total Confirmed: {global.TotalConfirmed.toLocaleString()}</p>
          <p>Total Deaths: {global.TotalDeaths.toLocaleString()}</p>
        </Card>
      )}
      <label>Select Country: 
        <select value={country} onChange={e => setCountry(e.target.value)}>
          <option value="">--</option>
          {countries.map(c => <option key={c.Slug} value={c.Slug}>{c.Country}</option>)}
        </select>
      </label>
      {selected && (
        <Card title={selected.Country}>
          <p>New Confirmed: {selected.NewConfirmed.toLocaleString()}</p>
          <p>Total Confirmed: {selected.TotalConfirmed.toLocaleString()}</p>
          <p>Total Deaths: {selected.TotalDeaths.toLocaleString()}</p>
        </Card>
      )}
      <CountryTrendChart slug={country} />
    </div>
  );
}
