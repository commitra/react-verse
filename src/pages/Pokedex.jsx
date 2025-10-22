// src/components/Pokedex.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";

export default function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingNames, setLoadingNames] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [allNames, setAllNames] = useState([]);
  const debounceRef = useRef(null);

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

  // Determine the list of names to display based on search; cap results to 60
  const matchedNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allNames.slice(0, 60);
    return allNames.filter((n) => n.includes(q)).slice(0, 60);
  }, [search, allNames]);

  // Array of pokemon details to render in the matched order
  const filtered = matchedNames.map((n) => pokemonByName.get(n)).filter(Boolean);

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

      <input
        style={inputStyle}
        placeholder="Search Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
                    onKeyPress={() => {}}
                  >
                    <div className="card-inner-gradient">
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
    </div>
  );
}
