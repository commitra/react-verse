/**
 * RECIPES DASHBOARD TODOs
 * -----------------------
 * Easy:
 *  - [ ] Show meal category & area on cards
 *  - [ ] Add skeleton loader for images
 *  - [ ] Improve random recipe section layout
 *  - [ ] Add clear search button
 * Medium:
 *  - [ ] Modal or drawer with full instructions & ingredients list
 *  - [ ] Filter by category / area (use list endpoints)
 *  - [ ] Pagination or load more
 *  - [ ] Favorite meals (localStorage)
 * Advanced:
 *  - [ ] Nutrition estimation integration (open API) – optional
 *  - [ ] Tag-based browsing (ingredient tags)
 *  - [ ] Offline caching of last search
 *  - [ ] Extract service + hook (useMealsSearch)
 */
import { useEffect, useState } from 'react';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';
import HeroSection from '../components/HeroSection';
import Food from '../Images/Food.jpg';

export default function Recipes() {
  const [ingredient, setIngredient] = useState('chicken');
  const [meals, setMeals] = useState([]);
  const [randomMeal, setRandomMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { search(); }, []);

  async function search() {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setMeals(json.meals || []);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  async function random() {
    try {
      setLoading(true); setError(null);
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setRandomMeal(json.meals?.[0] || null);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  return (
    <div>
      <HeroSection
      image={Food}
        title={
    <>
      Delicious Made <span style={{ color: 'yellow' }}>Simple</span>
    </>
  }
      subtitle="Wholesome recipes with heart, made easy for every home cook"
    />
      <h2>Recipe Finder</h2>
      <form onSubmit={e => { e.preventDefault(); search(); }} className="inline-form">
        <input value={ingredient} onChange={e => setIngredient(e.target.value)} placeholder="Ingredient" />
        <button type="submit">Search</button>
        <button type="button" onClick={random}>Random</button>
      </form>
      {loading && <Loading />}
      <ErrorMessage error={error} />
      {randomMeal && (
        <Card title={`Random: ${randomMeal.strMeal}`} footer={<a href={randomMeal.strSource} target="_blank" rel="noreferrer">Source</a>}>
          <img src={randomMeal.strMealThumb} alt="" width="100" />
          {/* TODO: Show instructions modal */}
        </Card>
      )}
      <div className="grid">
        {meals.map(m => (
          <Card key={m.idMeal} title={m.strMeal}>
            <img src={m.strMealThumb} alt="" width="100" />
          </Card>
        ))}
      </div>
    </div>
  );
}
