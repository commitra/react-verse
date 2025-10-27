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
import React, { useState } from "react";



export default function App() {
  const [query, setQuery] = useState("");
  const [loadedImages, setLoadedImages] = useState({});
  const [isDark, setIsDark] = useState(false);

  const dishes = [
    {
      id: 1,
      name: "Cheesy Burger",
      category: "Fast Food",
      area: "American",
      desc: "Juicy, cheesy and delicious.",
      img: "/src/images/burger.jpg",
    },
    {
      id: 2,
      name: "Creamy Pasta",
      category: "Main Course",
      area: "Italian",
      desc: "Rich and flavorful with herbs.",
      img: "/src/images/pasta.jpg",
    },
    {
      id: 3,
      name: "Fresh Salad",
      category: "Healthy",
      area: "Mediterranean",
      desc: "Crisp greens with a tangy dressing.",
      img: "/src/images/salad.jpeg",
    },
  ];

  const randomRecipe = [{
    id: 1,
    name: "Chicken Tikka Masala",
    category: "Main Course",
    area: "Indian",
    desc: "Aromatic curry with tender chicken pieces.",
    img: "/src/images/chicken.jpg",
  },
  {
    id: 2,
    name: "paneer Briyani",
    category: "Main Course",
    area: "Indian",
    desc: "Paneer biryani is a fragrant dish made with spiced paneer and basmati rice..",
    img: "/src/images/paneerBriyani.jpg",
  },
  ];

  
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(query.toLowerCase())
  );

  const filterRandomRecipe = randomRecipe.filter((randomDish) =>
    randomDish.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={`app ${isDark ? "dark" : "light"}`}>
      {/* Header */}
      <header>
        <h1>🍴 Recipes Dashboard</h1>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <h2>Find your next favorite recipe</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="What are you hungry for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          {query && (
            <button onClick={() => setQuery("")} className="clear-btn">
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Random Recipe */}
      <section className="random-recipe">
        <div className="cards-grid">
          {filterRandomRecipe.map((randomDish) => (
            <div className="card" key={randomDish.id}>
              <img src={randomDish.img} alt={randomDish.name} className="random-recipe-img" />
              <div className="random-recipe-info">
                <h3>{randomDish.name}</h3>
                <p>{randomDish.desc}</p>
                <p className="muted">
                  {randomDish.category} • {randomDish.area}
                </p>
                <button className="btn btn-primary">View Recipe</button>
              </div>
            </div>
          ))}

        </div>
      </section>


      {/* Cards */}
      <section className="cards-section">
        <h3 className="cards-title">Popular Recipes</h3>
        <div className="cards-grid">
          {filteredDishes.map((dish) => (
            <div className="card" key={dish.id}>
              {!loadedImages[dish.id] && <div className="skeleton" />}
              <img
                src={dish.img}
                alt={dish.name}
                style={{ display: loadedImages[dish.id] ? "block" : "none" }}
                onLoad={() =>
                  setLoadedImages((prev) => ({ ...prev, [dish.id]: true }))
                }
              />
              <h4>{dish.name}</h4>
              <p className="muted">
                {dish.category} • {dish.area}
              </p>
              <p>{dish.desc}</p>
              <button className="btn btn-primary">View Recipe</button>
            </div>
          ))}
        </div>
      </section>

      <footer>© {new Date().getFullYear()} Recipes Dashboard</footer>
    </div>
  );
}
