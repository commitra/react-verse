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
import { useEffect, useState, useCallback, useRef } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';
import CountryTrendChart from '../components/CountryTrendChart.jsx';

export default function Covid() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('');
  const isFetchingRef = useRef(false);

  const fetchSummary = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://disease.sh/v3/covid-19/countries');
      if (!res.ok) throw new Error('Failed to fetch country data');

      const json = await res.json();
      setSummary(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const countries = summary || [];
  const selected = countries.find(c => c.countryInfo.iso3 === country || c.country === country);

  // Compute simple global summary (sum across all countries)
  const global = countries.reduce(
    (acc, c) => {
      acc.cases += c.cases;
      acc.todayCases += c.todayCases;
      acc.deaths += c.deaths;
      acc.todayDeaths += c.todayDeaths;
      return acc;
    },
    { cases: 0, todayCases: 0, deaths: 0, todayDeaths: 0 }
  );

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

      {countries.length > 0 && (
        <Card title="Global Stats">
          <p>New Confirmed: {global.todayCases.toLocaleString()}</p>
          <p>Total Confirmed: {global.cases.toLocaleString()}</p>
          <p>Total Deaths: {global.deaths.toLocaleString()}</p>
        </Card>
      )}

      <label>
        Select Country:{' '}
        <select value={country} onChange={e => setCountry(e.target.value)}>
          <option value="">--</option>
          {countries.map(c => (
            <option key={c.countryInfo._id || c.country} value={c.country}>
              {c.country}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <Card title={selected.country}>
          <p>New Confirmed: {selected.todayCases.toLocaleString()}</p>
          <p>Total Confirmed: {selected.cases.toLocaleString()}</p>
          <p>Total Deaths: {selected.deaths.toLocaleString()}</p>
          <p>Updated: {new Date(selected.updated).toLocaleString()}</p>
        </Card>
      )}

      <CountryTrendChart slug={country} />
    </div>
  );
}
