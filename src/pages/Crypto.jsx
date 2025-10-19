/**
 * CRYPTO DASHBOARD TODOs
 * ----------------------
 * Easy:
 *  - [ ] Sort buttons (Market Cap, Price, 24h %)
 *  - [x] Show coin symbol & small logo (image URL in API)
 *  - [x] Format numbers with utility (abbreviate large caps: 1.2B)
 *  - [x] Highlight positive vs negative 24h change (green/red)
 * Medium:
 *  - [x] Add pagination (Top 50 -> allow next pages)
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

import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Card from "../components/Card.jsx";
import formatNumber from "../utilities/numberFormatter.js";
import HeroSection from '../components/HeroSection';
import CryptoImg from '../Images/Cryptocurrency.jpg';
import CryptoCalculatorModal from "../components/CryptoCalculatorModal.jsx";

export default function Crypto() {
  const [coins, setCoins] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    fetchCoins();
  }, [page]);

  async function fetchCoins() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${page}&sparkline=false`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setCoins(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = coins.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <HeroSection
      image= {CryptoImg}
        title={
    <>
      Decoding Digital <span style={{ color: 'green' }}>Currency</span>
    </>
  }
      subtitle="Empowering you to invest, trade, and understand crypto with confidence"
    />
      <h2>💹 Cryptocurrency Tracker</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search coin..."
        style={{ marginBottom: "1rem" }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => setIsCalculatorOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            whiteSpace: 'nowrap'
          }}
        >
          24h Calculator
        </button>
      </div>

      {loading && <Loading />}
      <ErrorMessage error={error} />

      <div className="grid">
        {filtered.map((c) => {
          const isPositive = c.price_change_percentage_24h >= 0;
          return (
            <Card
              key={c.id}
              title={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={c.image}
                    alt={c.symbol}
                    style={{ width: 24, height: 24, borderRadius: "50%" }}
                  />
                  {c.name} ({c.symbol.toUpperCase()})
                </span>
              }
              footer={<strong>${c.current_price.toLocaleString()}</strong>}
            >
              <p>Market Cap: ${formatNumber(c.market_cap)}</p>
              <p
                style={{
                  color: isPositive ? "#16a34a" : "#dc2626",
                  fontWeight: 600,
                }}
              >
                24h: {isPositive ? "+" : ""}
                {c.price_change_percentage_24h?.toFixed(2)}%
              </p>
              {/* TODO: Add mini sparkline chart */}
            </Card>
          );
        })}
      </div>

      <div
        className="pagination"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
          Previous
        </button>

        <span>Page {page}</span>

        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

        {isCalculatorOpen && coins.length > 0 && (
          <CryptoCalculatorModal
            coinData={coins}
            onClose={() => setIsCalculatorOpen(false)}
          />
        )}
        
    </div>
  );
}
