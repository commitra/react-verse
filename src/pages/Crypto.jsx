/**
 * CRYPTO DASHBOARD TODOs
 * ----------------------
 * Easy:
 *  - [ ] Sort buttons (Market Cap, Price, 24h %)
 *  - [ ] Show coin symbol & small logo (image URL in API)
 *  - [ ] Format numbers with utility (abbreviate large caps: 1.2B)
 *  - [ ] Highlight positive vs negative 24h change (green/red)
 * Medium:
 *  - [ ] Add pagination (Top 50 -> allow next pages)
 *  - [ ] Client-side caching with timestamp (avoid re-fetch spam)
 *  - [ ] Mini sparkline (use canvas or simple SVG)
 *  - [ ] Favorites (star) + localStorage persistence
 *  - [ ] Debounced search input
 * Advanced:
 *  - [ ] Historical price chart (CoinGecko market_chart endpoint)
 *  - [ ] Currency selector (USD/EUR/GBP)
 *  - [ ] Dark mode adaptive coloring for charts
 *  - [ ] Extract to service + custom hook (useCryptoMarkets)
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';

export default function Crypto() {
  const [coins, setCoins] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchCoins(); }, []);

  async function fetchCoins() {
    try {
      setLoading(true); setError(null);
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setCoins(json);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  const filtered = coins.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h2>Cryptocurrency Tracker</h2>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search coin" />
      {loading && <Loading />}
      <ErrorMessage error={error} />
      <div className="grid">
        {filtered.map(c => (
          <Card key={c.id} title={c.name} footer={<span>${c.current_price}</span>}>
            <p>Market Cap: ${c.market_cap.toLocaleString()}</p>
            <p>24h: {c.price_change_percentage_24h?.toFixed(2)}%</p>
            {/* TODO: Add mini sparkline chart */}
          </Card>
        ))}
      </div>
    </div>
  );
}
