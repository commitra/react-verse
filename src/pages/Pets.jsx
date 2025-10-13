/**
 * PETS (DOG & CAT) DASHBOARD TODOs
 * --------------------------------
 * Easy:
 *  - [ ] Loading skeleton for images
 *  - [ ] Click-to-refresh area (instead of button)
 *  - [ ] Show breed name overlay on dog image
 *  - [ ] Basic accessibility: alt text describing breed
 * Medium:
 *  - [ ] Persist favorites (localStorage)
 *  - [ ] Remove favorite (X button)
 *  - [ ] Download image / open in new tab control
 *  - [ ] Add cat breed info (needs different API – consider public cat API)
 * Advanced:
 *  - [ ] Masonry grid for favorites
 *  - [ ] Drag & reorder favorites, persist order
 *  - [ ] Tagging / labeling favorites (e.g., funny, cute)
 *  - [ ] Extract service + hook (useRandomDog, useRandomCat)
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';

export default function Pets() {
  const [dog, setDog] = useState(null);
  const [cat, setCat] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [breed, setBreed] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => { fetchDog(); fetchCat(); fetchBreeds(); }, []);

  async function fetchDog(selectedBreed) {
    try {
      setLoading(true); setError(null);
      const url = selectedBreed ? `https://dog.ceo/api/breed/${selectedBreed}/images/random` : 'https://dog.ceo/api/breeds/image/random';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setDog(json.message);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  async function fetchCat() {
    try {
      setLoading(true); setError(null);
      // cataas needs an image endpoint; for consistency just store URL
      const url = 'https://cataas.com/cat?timestamp=' + Date.now();
      setCat(url);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  async function fetchBreeds() {
    try {
      const res = await fetch('https://dog.ceo/api/breeds/list/all');
      if (!res.ok) throw new Error('Failed to fetch breeds');
      const json = await res.json();
      setBreeds(Object.keys(json.message));
    } catch (e) { /* ignore */ }
  }

  function favorite(url) {
    setFavorites(f => [...new Set([...f, url])]);
    // TODO: Persist favorites locally
  }

  return (
    <div>
      <h2>Dog & Cat Images</h2>
      {loading && <Loading />}
      <ErrorMessage error={error} />
      <div className="flex gap wrap">
        <div>
          <h3>Dog</h3>
          <select value={breed} onChange={e => { setBreed(e.target.value); fetchDog(e.target.value); }}>
            <option value="">Random Breed</option>
            {breeds.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div>
            {dog && <img src={dog} alt="dog" width="200" onClick={() => favorite(dog)} />}
          </div>
          <button onClick={() => fetchDog(breed)}>New Dog</button>
        </div>
        <div>
          <h3>Cat</h3>
          {cat && <img src={cat} alt="cat" width="200" onClick={() => favorite(cat)} />}
          <button onClick={fetchCat}>New Cat</button>
        </div>
      </div>
      <h3>Favorites</h3>
      <div className="flex gap wrap">
        {favorites.map(f => <img key={f} src={f} alt="favorite" width="100" />)}
      </div>
    </div>
  );
}
