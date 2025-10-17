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
import { estimateNutritionForIngredients, buildIngredientsFromMealDetail } from '../services/nutrition.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Card from '../components/Card.jsx';

export default function Recipes() {
  const [ingredient, setIngredient] = useState('chicken');
  const [meals, setMeals] = useState([]);
  const [randomMeal, setRandomMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState({});
  const [nutrition, setNutrition] = useState({});
  const [nLoading, setNLoading] = useState({});
  const [nError, setNError] = useState({});

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

  async function fetchMealDetail(id) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    return json.meals?.[0] || null;
  }

  async function toggleNutrition(mealId) {
    setOpen((o) => ({ ...o, [mealId]: !o[mealId] }));
    const isOpening = !open[mealId];
    if (!isOpening) return;
    if (nutrition[mealId] || nLoading[mealId]) return;
    setNError((e) => ({ ...e, [mealId]: null }));
    setNLoading((l) => ({ ...l, [mealId]: true }));
    try {
      const detail = await fetchMealDetail(mealId);
      if (!detail) throw new Error('Meal not found');
      const ingr = buildIngredientsFromMealDetail(detail);
      if (ingr.length === 0) throw new Error('No ingredients found');
      const est = await estimateNutritionForIngredients(ingr);
      setNutrition((n) => ({ ...n, [mealId]: est }));
    } catch (e) {
      setNError((er) => ({ ...er, [mealId]: e }));
    } finally {
      setNLoading((l) => ({ ...l, [mealId]: false }));
    }
  }

  return (
    <div>
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
        {meals.map(m => {
          const isOpen = !!open[m.idMeal];
          const data = nutrition[m.idMeal];
          const isNL = !!nLoading[m.idMeal];
          const err = nError[m.idMeal];
          return (
            <Card key={m.idMeal} title={m.strMeal}>
              <img src={m.strMealThumb} alt="" width="100" />
              <button type="button" onClick={() => toggleNutrition(m.idMeal)}>
                {isOpen ? 'Hide Nutrition' : 'More Nutrition Info'}
              </button>
              {isOpen && (
                <div style={{ marginTop: '0.5rem' }}>
                  {isNL && <Loading />}
                  <ErrorMessage error={err} />
                  {data && !isNL && !err && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr><td>Calories</td><td style={{ textAlign: 'right' }}>{data.calories?.toLocaleString?.() || 0}</td></tr>
                        <tr><td>Carbs (g)</td><td style={{ textAlign: 'right' }}>{data.carbsG}</td></tr>
                        <tr><td>Protein (g)</td><td style={{ textAlign: 'right' }}>{data.proteinG}</td></tr>
                        <tr><td>Fat (g)</td><td style={{ textAlign: 'right' }}>{data.fatG}</td></tr>
                        <tr><td>Fiber (g)</td><td style={{ textAlign: 'right' }}>{data.fiberG}</td></tr>
                        <tr><td>Sugar (g)</td><td style={{ textAlign: 'right' }}>{data.sugarG}</td></tr>
                        <tr><td>Sodium (mg)</td><td style={{ textAlign: 'right' }}>{data.sodiumMg}</td></tr>
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
