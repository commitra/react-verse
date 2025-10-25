// src/components/Pokedex.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";

export default function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingNames, setLoadingNames] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [allNames, setAllNames] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [pokemonDetails, setPokemonDetails] = useState({});
  const debounceRef = useRef(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('pokemon-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('pokemon-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // On mount: fetch all names (lightweight) and then load initial details for first page
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // fetch all names (small payload of names/urls)
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000");
        const list = await res.json();
        if (!mounted) return;
        const names = list.results.map((r) => r.name);
        setAllNames(names);
        setLoadingNames(false);

        // Fetch details for first 60 to populate initial UI
        const initial = names.slice(0, 60);
        await fetchDetailsForNames(initial);
      } catch (e) {
        console.error("fetch error", e);
        setLoadingNames(false);
        setLoadingDetails(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch detailed Pokemon information including moves
  async function fetchPokemonDetails(pokemonName) {
    if (pokemonDetails[pokemonName]) return pokemonDetails[pokemonName];
    
    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`)
      ]);
      
      if (!pokemonRes.ok || !speciesRes.ok) return null;
      
      const [pokemonData, speciesData] = await Promise.all([
        pokemonRes.json(),
        speciesRes.json()
      ]);
      
      const details = {
        ...pokemonData,
        species: speciesData,
        moves: pokemonData.moves?.slice(0, 10) || [], // Get first 10 moves
        abilities: pokemonData.abilities || [],
        stats: pokemonData.stats || []
      };
      
      setPokemonDetails(prev => ({ ...prev, [pokemonName]: details }));
      return details;
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
      return null;
    }
  }

  // Fetch details helper (accepts array of names)
  async function fetchDetailsForNames(names) {
    if (!names || names.length === 0) return;
    setLoadingDetails(true);
    try {
      // Only fetch those we don't already have
      const existing = new Set(pokemon.map((p) => p.name));
      const toFetch = names.filter((n) => !existing.has(n));
      if (toFetch.length === 0) return;

      const details = await Promise.all(
        toFetch.map(async (name) => {
          try {
            const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!r.ok) throw new Error(`not found ${name}`);
            return await r.json();
          } catch (err) {
            // swallow individual errors
            return null;
          }
        })
      );

      const valid = details.filter(Boolean);
      if (valid.length > 0) {
        setPokemon((prev) => {
          // merge without duplicates
          const map = new Map(prev.map((p) => [p.name, p]));
          valid.forEach((d) => map.set(d.name, d));
          return Array.from(map.values());
        });
      }
    } catch (e) {
      console.error("detail fetch error", e);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Build a map for quick lookup
  const pokemonByName = useMemo(() => new Map(pokemon.map((p) => [p.name, p])), [pokemon]);

  // Get all unique types from loaded Pokemon
  const availableTypes = useMemo(() => {
    const types = new Set();
    pokemon.forEach(p => {
      p.types?.forEach(t => types.add(t.type.name));
    });
    return Array.from(types).sort();
  }, [pokemon]);

  // Determine the list of names to display based on search, type filter, and favorites
  const matchedNames = useMemo(() => {
    let filtered = allNames;
    
    // Apply search filter
    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((n) => n.includes(q));
    }
    
    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(name => {
        const pokemonData = pokemonByName.get(name);
        return pokemonData?.types?.some(t => t.type.name === selectedType);
      });
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(name => favorites.has(name));
    }
    
    return filtered.slice(0, 60);
  }, [search, allNames, selectedType, showFavoritesOnly, favorites, pokemonByName]);

  // Array of pokemon details to render in the matched order
  const filtered = matchedNames.map((n) => pokemonByName.get(n)).filter(Boolean);

  // Handle Pokemon selection for modal
  const handlePokemonClick = async (pokemon) => {
    setSelectedPokemon(pokemon);
    await fetchPokemonDetails(pokemon.name);
  };

  // Handle favorite toggle
  const toggleFavorite = (pokemonName) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(pokemonName)) {
        newFavorites.delete(pokemonName);
      } else {
        newFavorites.add(pokemonName);
      }
      return newFavorites;
    });
  };

  // Debounced effect: when `search` changes, fetch details for the top matches
  useEffect(() => {
    // clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // If there's no names loaded yet, nothing to do
    if (!allNames || allNames.length === 0) return;

    debounceRef.current = setTimeout(() => {
      // find matches (top 40)
      const q = search.trim().toLowerCase();
      const namesToLoad = q ? allNames.filter((n) => n.includes(q)).slice(0, 40) : allNames.slice(0, 40);
      fetchDetailsForNames(namesToLoad);
    }, 260);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, allNames]);

  // Inline style objects for a few dynamic bits:
  const containerStyle = {
    minHeight: "100vh",
    padding: "44px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#111",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  };

  const titleStyle = {
    fontSize: "3rem",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "3px",
    textShadow: "0 6px 14px rgba(0,0,0,0.35)",
    margin: "0 0 18px 0",
  };

  const inputStyle = {
    width: "280px",
    padding: "10px 14px",
    borderRadius: "26px",
    border: "none",
    outline: "none",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "1rem",
    marginBottom: "28px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "24px",
    width: "100%",
    maxWidth: "1120px",
  };

  const cardBaseStyle = {
    position: "relative",
    borderRadius: "18px",
    padding: "18px",
    textAlign: "center",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform .28s cubic-bezier(.2,.9,.2,1), box-shadow .28s ease, filter .28s ease",
    boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
    willChange: "transform",
    userSelect: "none",
  };

  return (
    <div style={containerStyle}>
      {/* Embedded CSS (keyframes, classes, responsive tweaks). This keeps everything in one file. */}
      <style>{`
        /* background gradient animation */
        .bg-gradient {
          width: 100%;
          position: fixed;
          inset: 0;
          z-index: -1;
          background: linear-gradient(135deg, #ffd54f 0%, #ff6b6b 35%, #ff66b2 70%);
          background-size: 300% 300%;
          animation: bgShift 10s ease infinite;
          filter: saturate(1.04);
        }
        @keyframes bgShift {
          0% { background-position: 0% 50%;}
          50% { background-position: 100% 50%;}
          100% { background-position: 0% 50%;}
        }

        /* pokeball spinner */
        .pokeball-spinner {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          border: 7px solid rgba(255,255,255,0.95);
          border-top: 7px solid #e53935;
          box-shadow: 0 8px 26px rgba(0,0,0,0.22);
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-top: 48px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* card hover/glow via class */
        .card-hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.06);
        }

        .card-inner-gradient {
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.06));
          padding: 10px;
          border-radius: 12px;
        }

        .pokemon-img {
          width: 104px;
          height: 104px;
          object-fit: contain;
          margin: 6px auto 10px auto;
          filter: drop-shadow(2px 8px 18px rgba(0,0,0,0.25));
          transition: transform .36s cubic-bezier(.2,.9,.2,1);
        }

        .card-name {
          font-size: 1.14rem;
          font-weight: 800;
          color: #fff;
          text-transform: capitalize;
          margin: 8px 0 6px 0;
          text-shadow: 0 4px 10px rgba(0,0,0,0.35);
        }

        .types {
          display:flex;
          justify-content:center;
          gap:8px;
          flex-wrap:wrap;
        }

        .type-pill {
          background: rgba(255,255,255,0.14);
          color: #fff;
          padding:6px 10px;
          border-radius: 999px;
          font-weight:700;
          font-size:0.86rem;
          text-transform:capitalize;
          box-shadow: 0 3px 10px rgba(0,0,0,0.16);
          backdrop-filter: blur(4px);
        }

        .pokeball-deco {
          position:absolute;
          bottom:-22px;
          right:-22px;
          width:86px;
          opacity:0.14;
          transform: rotate(18deg);
          pointer-events:none;
        }

        /* subtle floating on hover */
        .card-wrap:hover { transform: translateY(-10px) scale(1.03); filter: brightness(1.04); box-shadow: 0 18px 40px rgba(0,0,0,0.28); }
        .card-wrap:active { transform: translateY(-2px) scale(.995); }

        /* image zoom on hover */
        .card-wrap:hover .pokemon-img { transform: translateY(-6px) scale(1.06); }

        /* responsive tweaks */
        @media (max-width:640px) {
          .title-small { font-size: 2.2rem !important; margin-bottom:12px; }
          input[placeholder] { width: 86% !important; max-width: 320px; }
        }

        /* nice glass panel behind grid */
        .grid-panel {
          width: 100%;
          max-width: 1150px;
          padding: 18px;
          border-radius: 16px;
          margin-top: 6px;
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          box-shadow: 0 10px 40px rgba(0,0,0,0.18);
          backdrop-filter: blur(6px);
        }

      `}</style>

      <div className="bg-gradient" aria-hidden="true" />

      <h1 style={titleStyle} className="title-small">PokéDex</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '600px' }}>
        <input
          style={inputStyle}
          placeholder="Search Pokémon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <select
            style={{
              padding: '8px 12px',
              borderRadius: '20px',
              border: 'none',
              outline: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: 'rgba(255,255,255,0.9)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer'
            }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
          
          <button
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              outline: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: showFavoritesOnly ? '#ff6b6b' : 'rgba(255,255,255,0.9)',
              color: showFavoritesOnly ? 'white' : '#333',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? '⭐ Favorites' : '⭐ Show Favorites'}
          </button>
        </div>
      </div>

      {(loadingNames || (loadingDetails && pokemon.length === 0)) ? (
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div className="pokeball-spinner" aria-label="Loading" />
        </div>
      ) : (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div className="grid-panel" style={{ width: "100%" }}>
            <div style={gridStyle}>
              {filtered.map((p) => {
                // fallback color by primary type:
                const primaryType = p.types[0]?.type?.name || "normal";
                const typeColors = {
                  fire: ["#ff9a65", "#ff6b6b"],
                  water: ["#8ec5ff", "#5aa3ff"],
                  grass: ["#a8ff8c", "#3bb78f"],
                  electric: ["#ffd56b", "#ffcc33"],
                  psychic: ["#ff9ad5", "#ff6fb1"],
                  rock: ["#d6d6a3", "#b29b6b"],
                  ground: ["#efd6b8", "#d29b5b"],
                  bug: ["#d8f3a6", "#8ecb3f"],
                  poison: ["#d6a8ff", "#9b67ff"],
                  fairy: ["#ffdff6", "#ff9adf"],
                  fighting: ["#ffb59a", "#ff7043"],
                  flying: ["#cfe9ff", "#9ad0ff"],
                  ghost: ["#c5b7ff", "#8f77ff"],
                  dragon: ["#b8e1ff", "#6fb3ff"],
                  ice: ["#dff8ff", "#8fe9ff"],
                  dark: ["#c6b8b0", "#8b7f70"],
                  steel: ["#d7e0e6", "#9fb0bd"],
                  normal: ["#f5f5f5", "#dcdcdc"]
                };
                const colors = typeColors[primaryType] || typeColors.normal;
                const cardStyle = {
                  ...cardBaseStyle,
                  background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                  color: "#111",
                };

                return (
                  <div
                    key={p.id}
                    className="card-wrap"
                    style={cardStyle}
                    title={`${p.name} (#${p.id})`}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePokemonClick(p);
                      }
                    }}
                    onClick={() => handlePokemonClick(p)}
                  >
                    <div className="card-inner-gradient">
                      <button
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          zIndex: 10,
                          filter: favorites.has(p.name) ? 'none' : 'grayscale(100%)',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(p.name);
                        }}
                        title={favorites.has(p.name) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.has(p.name) ? '⭐' : '☆'}
                      </button>
                      
                      <img
                        src={p.sprites?.other?.["official-artwork"]?.front_default || p.sprites?.front_default || ""}
                        alt={p.name}
                        className="pokemon-img"
                        onError={(e) => {
                          e.currentTarget.style.opacity = 0.6;
                        }}
                      />

                      <div className="card-name" style={{ color: "#fff" }}>
                        {p.name}
                      </div>

                      <div className="types" aria-hidden="false">
                        {p.types.map((t) => (
                          <div key={t.type.name} className="type-pill">
                            {t.type.name}
                          </div>
                        ))}
                      </div>

                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                        alt=""
                        className="pokeball-deco"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedPokemon(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
              onClick={() => setSelectedPokemon(null)}
            >
              ×
            </button>

            {pokemonDetails[selectedPokemon.name] ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <img
                    src={selectedPokemon.sprites?.other?.["official-artwork"]?.front_default || selectedPokemon.sprites?.front_default || ""}
                    alt={selectedPokemon.name}
                    style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                  />
                  <h2 style={{ fontSize: '2rem', margin: '10px 0', textTransform: 'capitalize' }}>
                    {selectedPokemon.name}
                  </h2>
                  <p style={{ color: '#666', fontSize: '1.1rem' }}>
                    #{selectedPokemon.id}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {/* Types */}
                  <div>
                    <h3 style={{ marginBottom: '10px', color: '#333' }}>Types</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedPokemon.types.map((t) => (
                        <span
                          key={t.type.name}
                          style={{
                            backgroundColor: '#f0f0f0',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            textTransform: 'capitalize'
                          }}
                        >
                          {t.type.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Abilities */}
                  <div>
                    <h3 style={{ marginBottom: '10px', color: '#333' }}>Abilities</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {pokemonDetails[selectedPokemon.name].abilities.map((ability, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#e8f4fd',
                            padding: '6px 12px',
                            borderRadius: '15px',
                            fontSize: '0.9rem',
                            textTransform: 'capitalize'
                          }}
                        >
                          {ability.ability.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h3 style={{ marginBottom: '10px', color: '#333' }}>Base Stats</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pokemonDetails[selectedPokemon.name].stats.map((stat, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>
                            {stat.stat.name.replace('-', ' ')}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '100px', height: '6px', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(100, (stat.base_stat / 150) * 100)}%`,
                                  height: '100%',
                                  backgroundColor: stat.base_stat > 100 ? '#4caf50' : stat.base_stat > 70 ? '#ff9800' : '#f44336',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', minWidth: '30px' }}>
                              {stat.base_stat}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moves */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ marginBottom: '10px', color: '#333' }}>Moves</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {pokemonDetails[selectedPokemon.name].moves.map((move, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            textTransform: 'capitalize',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          {move.move.name.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="pokeball-spinner" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '20px', color: '#666' }}>Loading details...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
