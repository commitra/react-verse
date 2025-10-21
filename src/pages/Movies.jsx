/**
 * MOVIES (GHIBLI) DASHBOARD TODOs
 * -------------------------------
 * Easy:
 *  - [x] Add IMDb Ratings using OMDb API (with caching)
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
import HeroSection from '../components/HeroSection';
import Cinema from '../Images/Movie.jpg';
import Modal from '../components/Modal.jsx';

export default function Movies() {
  const [films, setFilms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);

  const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
  const isLocal = window.location.hostname === 'localhost';

  // 🧠 Fetch and cache IMDb rating (refresh automatically in local)
  async function fetchIMDbRating(title) {
    const cacheKey = `imdb_${title}`;
    const cached = localStorage.getItem(cacheKey);

    // If not local and cached data exists, use it
    if (!isLocal && cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // continue to fetch
      }
    }

    // Otherwise, fetch fresh data
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`
      );
      const data = await res.json();

      if (data && data.imdbRating) {
        const ratingObj = { imdbRating: data.imdbRating };
        if (!isLocal) localStorage.setItem(cacheKey, JSON.stringify(ratingObj));
        return ratingObj;
      }
    } catch (err) {
      console.error('Failed to fetch IMDb rating for', title, err);
    }

    return { imdbRating: 'N/A' };
  }

  // 🎬 Fetch Ghibli films and attach IMDb ratings
  async function fetchFilms() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('https://ghibliapi.vercel.app/films');
      if (!res.ok) throw new Error('Failed to fetch films');
      const filmsData = await res.json();

      const filmsWithRatings = await Promise.all(
        filmsData.map(async (film) => {
          const imdb = await fetchIMDbRating(film.title);
          return { ...film, ...imdb };
        })
      );

      setFilms(filmsWithRatings);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFilms();
  }, []);

  // 🧩 Filters
  const filtered = films.filter(
    (f) =>
      f.director.toLowerCase().includes(filter.toLowerCase()) ||
      f.release_date.includes(filter)
  );

  // 🎞️ Modal Handlers
  const openModal = (film) => {
    setSelectedFilm(film);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFilm(null);
  };

  return (
    <div>
      <HeroSection
        image={Cinema}
        title={
          <>
            Lights, Camera, <span style={{ color: 'darkred' }}>Binge!</span>
          </>
        }
        subtitle="Dive deep into storytelling, performances, and the art of filmmaking."
      />
      <h2>Studio Ghibli Films</h2>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by director or year"
      />

      {loading && <Loading />}
      <ErrorMessage error={error} />

      <div className="grid">
        {filtered.map((f) => (
          <div
            key={f.id}
            type="button"
            onClick={() => openModal(f)}
            aria-label={`Open details for ${f.title}`}
            style={{ display: 'contents', cursor: 'pointer' }}
          >
            <Card
              title={`${f.title} (${f.release_date})`}
              japaneseTitle={f.original_title}
              image={f.image}
            >
              <p>
                <strong>Director:</strong> {f.director}
              </p>
              <p>
                <span
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: 'white',
                  }}
                >
                  IMDb Rating:
                </span>{' '}
                ⭐ {f.imdbRating || 'N/A'}
              </p>
              <p>{f.description.slice(0, 120)}...</p>
            </Card>
          </div>
        ))}
      </div>

      {isModalOpen && selectedFilm && (
        <Modal open={isModalOpen} onClose={closeModal} film={selectedFilm} />
      )}
    </div>
  );
}
