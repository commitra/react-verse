import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';
import HeroSection from '../components/HeroSection';
import Cinema from '../Images/Movie.jpg';
import Modal from '../components/Modal.jsx';
import { getCachedMovies, saveMoviesToCache } from '../utilities/db';

export default function Movies() {
  const [films, setFilms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
  const isLocal = window.location.hostname === 'localhost';

  // 🧠 Fetch and cache IMDb rating (refresh automatically in local)
  async function fetchIMDbRating(title) {
    if (!OMDB_API_KEY) return { imdbRating: 'N/A' };

    const cacheKey = `imdb_${title}`;
    const cached = localStorage.getItem(cacheKey);

    // If not local and cached data exists, use it
    if (!isLocal && cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fall through to fetch
      }
    }

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

  // Listen for online/offline and update state
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Load films (with offline cache fallback and IMDb enrichment)
  useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);

        if (isOffline) {
          // --- OFFLINE LOGIC ---
          const cachedFilms = await getCachedMovies();
          if (cachedFilms && cachedFilms.length > 0) {
            if (!cancelled) setFilms(cachedFilms);
          } else {
            throw new Error('You are offline and no cached movies are available.');
          }
        } else {
          // --- ONLINE LOGIC ---
          const res = await fetch('https://ghibliapi.vercel.app/films');
          if (!res.ok) throw new Error('Failed to fetch from API');

          const filmsData = await res.json();

          // Enrich with IMDb ratings in parallel (but limit concurrency if needed)
          const filmsWithRatings = await Promise.all(
            filmsData.map(async (film) => {
              const imdb = await fetchIMDbRating(film.title);
              return { ...film, ...imdb };
            })
          );

          if (!cancelled) setFilms(filmsWithRatings);

          // Save to indexedDB / cache for offline use
          try {
            await saveMoviesToCache(filmsWithRatings);
          } catch (cacheErr) {
            console.warn('Failed to save movies to cache:', cacheErr);
          }
        }
      } catch (e) {
        console.error('Error during data loading:', e);

        // Attempt cache fallback if online fetch failed
        if (!isOffline) {
          try {
            const cachedFilms = await getCachedMovies();
            if (cachedFilms && cachedFilms.length > 0) {
              if (!cancelled) {
                setFilms(cachedFilms);
                setError(null);
              }
            } else {
              if (!cancelled) setError(e);
            }
          } catch (cacheError) {
            console.error('Cache fallback failed:', cacheError);
            if (!cancelled) setError(e);
          }
        } else {
          if (!cancelled) setError(e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, [isOffline]);

  // 🧩 Filters
  const filtered = films.filter(
    (f) =>
      f.director?.toLowerCase().includes(filter.toLowerCase()) ||
      f.release_date?.includes(filter)
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

      {isOffline && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#333',
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            margin: '10px 0',
          }}
        >
          You are in offline mode.
        </div>
      )}

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
            role="button"
            onClick={() => openModal(f)}
            aria-label={`Open details for ${f.title}`}
            style={{ display: 'contents', cursor: 'pointer' }}
          >
            <Card title={`${f.title} (${f.release_date})`} japaneseTitle={f.original_title} image={f.image}>
              <p>
                <strong>Director:</strong> {f.director}
              </p>

              <p>
                <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'white' }}>
                  IMDb Rating:
                </span>{' '}
                ⭐ {f.imdbRating || 'N/A'}
              </p>

              <p>{f.description?.slice(0, 120)}...</p>
            </Card>
          </div>
        ))}
      </div>

      {isModalOpen && selectedFilm && <Modal open={isModalOpen} onClose={closeModal} film={selectedFilm} />}
    </div>
  );
}
