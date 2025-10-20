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

  // 🗝️ Replace with your own OMDb API key
  const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;


  useEffect(() => {
    fetchFilms();
  }, []);

  async function fetchFilms() {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch Ghibli films
      const res = await fetch('https://ghibliapi.vercel.app/films');
      if (!res.ok) throw new Error('Failed to fetch');
      const filmsData = await res.json();

      // Step 2: Fetch IMDb rating for each film
      const filmsWithRatings = await Promise.all(
        filmsData.map(async (film) => {
          try {
            const omdbRes = await fetch(
              `https://www.omdbapi.com/?t=${encodeURIComponent(film.title)}&apikey=${OMDB_API_KEY}`
            );
            const omdbData = await omdbRes.json();
            return {
              ...film,
              imdbRating: omdbData.imdbRating || 'N/A', // ⭐ IMDb rating section
            };
          } catch {
            return { ...film, imdbRating: 'N/A' };
          }
        })
      );

      setFilms(filmsWithRatings);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = films.filter(
    (f) =>
      f.director.toLowerCase().includes(filter.toLowerCase()) ||
      f.release_date.includes(filter)
  );

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
            style={{
              display: 'contents',
              cursor: 'pointer',
            }}
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
                <strong>IMDb Rating:</strong> ⭐ {f.imdbRating}
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
