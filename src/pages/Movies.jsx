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
 *  - [X] Offline cache using indexedDB (e.g., idb library)
 *  - [ ] Extract data layer + hook (useGhibliFilms)
 */
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

  useEffect(() => {
    const handleOffline = () => {
      console.log('App is offline');
      setIsOffline(true);
    };
    const handleOnline = () => {
      console.log('App is online');
      setIsOffline(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);

        if (isOffline) {
          // --- OFFLINE LOGIC ---
          const cachedFilms = await getCachedMovies();
          if (cachedFilms.length > 0) {
            setFilms(cachedFilms);
          } else {
            setError(new Error("You are offline and no cached movies are available."));
          }
        } else {
          // --- ONLINE LOGIC ---
          const res = await fetch('https://ghibliapi.vercel.app/films');
          if (!res.ok) throw new Error('Failed to fetch from API');
          
          const json = await res.json();
          setFilms(json);
          
          await saveMoviesToCache(json);
        }
      } catch (e) {
        console.error('Error during data loading:', e);
        
        if (!isOffline) {
          console.log('API failed, attempting to load from cache...');
          try {
            const cachedFilms = await getCachedMovies();
            if (cachedFilms.length > 0) {
              setFilms(cachedFilms);
              setError(null); 
            } else {
              setError(new Error("API failed and no cached data is available."));
            }
          } catch (cacheError) {
            console.error('Cache fallback failed:', cacheError);
            setError(e);
          }
        } else {
          setError(e);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [isOffline]); 

  const filtered = films.filter(f => f.director.toLowerCase().includes(filter.toLowerCase()) || f.release_date.includes(filter));

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
        <div style={{
          padding: '10px',
          backgroundColor: '#333',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          margin: '10px 0'
        }}>
          You are in offline mode.
        </div>
      )}

      <h2>Studio Ghibli Films</h2>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by director or year" />
      {loading && <Loading />}
      <ErrorMessage error={error} />
      <div className="grid">
        {filtered.map(f => (
            <div
            key={f.id}
            type="button"
            onClick={() => openModal(f)}
            aria-label={`Open details for ${f.title}`}
            style={{
              display: 'contents',
              cursor: 'pointer',
            }}
          >
            <Card title={`${f.title} (${f.release_date})`} japaneseTitle={f.original_title} image={f.image}>
              <p><strong>Director:</strong> {f.director}</p>
              <p>{f.description.slice(0,120)}...</p>
              {/* TODO: Add poster images (need mapping) */}
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
