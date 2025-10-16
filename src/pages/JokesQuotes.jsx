/**
 * JOKES & QUOTES DASHBOARD TODOs
 * ------------------------------
 * Easy:
 *  - [ ] Separate loading states for joke vs quote vs search
 *  - [ ] Add copy-to-clipboard buttons
 *  - [ ] Add share (tweet) link for quote
 *  - [ ] Limit search results, add message when empty
 * Medium:
 *  - [ ] Favorites with localStorage (jokes & quotes)
 *  - [ ] Filter quotes by author (dropdown built from results)
 *  - [ ] Add pagination / infinite scroll for quotes search
 *  - [ ] Debounced search input
 * Advanced:
 *  - [ ] Multi-source quotes aggregator (optional additional APIs)
 *  - [ ] Tag cloud of popular quote tags
 *  - [ ] Export favorites (JSON download)
 *  - [ ] Extract hooks: useRandomJoke, useRandomQuote, useQuoteSearch
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';

export default function JokesQuotes() {
  const [joke, setJoke] = useState(null);
  const [quote, setQuote] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchJoke(); fetchQuote(); }, []);

  async function fetchJoke() {
    try {
      setLoading(true); setError(null);
      const res = await fetch('https://official-joke-api.appspot.com/random_joke');
      if (!res.ok) throw new Error('Failed to fetch');
      setJoke(await res.json());
    } catch (e) { setError(e); } finally { setLoading(false); }
  }
  
  async function fetchQuote() {
  try {
    setLoading(true); setError(null);
    const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://zenquotes.io/api/random'));
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    const quotes = JSON.parse(data.contents);
    setQuote({content: quotes[0].q, author: quotes[0].a});
  } catch (e) { setError(e); } finally { setLoading(false); }
}


  async function searchQuotes() {
    if (!search) return;
    try {
      setLoading(true); setError(null);
      const res = await fetch(`https://api.quotable.io/quotes?query=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setResults(json.results || []);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  return (
    <div>
      <h2>Jokes & Quotes</h2>
      <div className="flex gap">
        <button onClick={fetchJoke}>New Joke</button>
        <button onClick={fetchQuote}>New Quote</button>
      </div>
      {loading && <Loading />}
      <ErrorMessage error={error} />
      {joke && (
        <Card title="Joke">
          <p>{joke.setup}</p>
          <p><em>{joke.punchline}</em></p>
        </Card>
      )}
      {quote && (
        <Card title="Quote">
          <blockquote>“{quote.content}” — {quote.author}</blockquote>
        </Card>
      )}
      <form onSubmit={e => { e.preventDefault(); searchQuotes(); }} className="inline-form">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotes" />
        <button type="submit">Search</button>
      </form>
      <div className="grid">
        {results.map(r => (
          <Card key={r._id}>
            <blockquote>“{r.content}” — {r.author}</blockquote>
          </Card>
        ))}
      </div>
      {/* TODO: Add favorites & local storage */}
    </div>
  );
}
