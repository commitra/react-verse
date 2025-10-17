/**
 * MOVIES (GHIBLI) DASHBOARD TODOs
 * -------------------------------
 * Easy:
 *  - [ ] Add select dropdown for director filtering instead of text filter
 *  - [ ] Add film poster (map titles to known images or placeholder search)
 *  - [ ] Show running time, score, producer fields
 *  - [ ] Expand/collapse description
 * Medium:
 *  - [ ] Client-side pagination / virtualization for performance (future if many APIs)
 *  - [ ] Favorites / watchlist (localStorage)
 *  - [ ] Sort (Year asc/desc, Title A-Z, RT Score)
 *  - [ ] Detail modal with full info & external links
 * Advanced:
 *  - [ ] Pre-fetch details or combine with other Studio Ghibli endpoints (people, locations)
 *  - [ ] Add fuzzy search (title, director, description)
 *  - [ ] Offline cache using indexedDB (e.g., idb library)
 *  - [ ] Extract data layer + hook (useGhibliFilms)
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';

export default function Movies() {
  const [films, setFilms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchFilms(); }, []);

  async function fetchFilms() {
    try {
      setLoading(true); setError(null);
      const res = await fetch('https://ghibliapi.vercel.app/films');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setFilms(json);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  const filtered = films.filter(f => f.director.toLowerCase().includes(filter.toLowerCase()) || f.release_date.includes(filter));

  return (
    <div>
      <h2>Studio Ghibli Films</h2>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by director or year" />
      {loading && <Loading />}
      <ErrorMessage error={error} />
      <div className="grid">
        {filtered.map(f => (
          <Card key={f.id}  title={`${f.title} (${f.release_date})`} japaneseTitle={f.original_title} image={f.image}>
            <p><strong>Director:</strong> {f.director}</p>
            <p>{f.description.slice(0,120)}...</p>
            {/* TODO: Add poster images (need mapping) */}
          </Card>
        ))}
      </div>
    </div>
  );
}
