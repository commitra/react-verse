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
          <h2 className='text-center mt-3 font-bold'>Recipe Finder</h2>

          <div className='flex justify-center p-3'>

            <form onSubmit={e => { e.preventDefault(); search(); }} className="inline-form">
              <input value={ingredient} onChange={e => setIngredient(e.target.value)} placeholder="Ingredient" className="border rounded-lg px-3 py-2 text-sm sm:text-base" />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm sm:px-6 sm:py-2 sm:text-base">Search</button>
              <button type="button" onClick={random} className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm sm:px-6 sm:py-2 sm:text-base">Random</button>
            </form>

          </div>
          
          {loading && <Loading />}
          <ErrorMessage error={error} />
          {randomMeal && (
          <div className="max-w-sm mx-auto mb-10 text-center">
  
            <Card
            
              title={
                <div className="relative">
                {`Random: ${randomMeal.strMeal}`}
                 <button
                    onClick={() => setRandomMeal(null)}
                    className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              }
              
              footer={
                <a
                  href={randomMeal.strSource}
                  target="_blank"
                  rel="noreferrer"
                  className="text-yellow-500 hover:underline"
                >
                  View Source →
                  
                </a>
              }
            
            >
              
              <div className="flex justify-center items-center">
                <img
                  src={randomMeal.strMealThumb}
                  alt={randomMeal.strMeal}
                  className="w-40 h-40 rounded-xl"
                />
              </div>
            </Card>
          </div>
        )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            
              {meals.map((m) => (
          <div key={m.idMeal} className='text-center'>
            <Card title={m.strMeal}>
              <div className="flex justify-center items-center p-4">
                <div className="w-60 h-60 overflow-hidden rounded-xl">
                  <img
                    src={m.strMealThumb}
                    alt={m.strMeal}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card>
        </div>
      ))}  
          </div>
        </div>
      );
    }
