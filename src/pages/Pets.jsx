import { useEffect, useState } from "react";
import { Heart, X, Download, ExternalLink, RefreshCw } from "lucide-react";

export default function Pets() {
  const [dog, setDog] = useState(null);
  const [cat, setCat] = useState(null);
  const [catBreed, setCatBreed] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [breed, setBreed] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState({ dog: false, cat: false });
  const [favorites, setFavorites] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [catBreeds, setCatBreeds] = useState([]);
  const [selectedCatBreed, setSelectedCatBreed] = useState("");

  useEffect(() => {
    fetchDog();
    fetchCat();
    fetchBreeds();
    fetchCatBreeds();
  }, []);

  async function fetchDog(selectedBreed) {
    try {
      setLoading(true);
      setImageLoading((prev) => ({ ...prev, dog: true }));
      setError(null);
      const url = selectedBreed
        ? `https://dog.ceo/api/breed/${selectedBreed}/images/random`
        : "https://dog.ceo/api/breeds/image/random";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch dog");
      const json = await res.json();
      setDog({ url: json.message, breed: selectedBreed || "mixed breed" });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setImageLoading((prev) => ({ ...prev, dog: false }));
    }
  }

  async function fetchBreeds() {
    try {
      const res = await fetch("https://dog.ceo/api/breeds/list/all");
      if (!res.ok) throw new Error("Failed to fetch breeds");
      const json = await res.json();
      setBreeds(Object.keys(json.message));
    } catch (e) {
      setError(e.message);
    }
  }

  async function fetchCat(selectedBreed) {
    try {
      setLoading(true);
      setImageLoading((prev) => ({ ...prev, cat: true }));
      setError(null);

      // Construct API URL
      let url = "https://api.thecatapi.com/v1/images/search";
      if (selectedBreed) url += `?breed_ids=${selectedBreed}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cat");
      const json = await res.json();

      if (json.length > 0) {
        const breedName = json[0].breeds?.[0]?.name || "Random";
        setCat({ url: json[0].url, breed: breedName });
        setCatBreed(breedName);
      } else {
        // fallback if no image returned
        setCat({ url: "", breed: "Random" });
        setCatBreed("Random");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setImageLoading((prev) => ({ ...prev, cat: false }));
    }
  }

  async function fetchCatBreeds() {
    try {
      const res = await fetch("https://api.thecatapi.com/v1/breeds");
      if (!res.ok) throw new Error("Failed to fetch cat breeds");
      const data = await res.json();
      setCatBreeds(data); // store full breed info including id and name
    } catch (err) {
      console.error(err);
    }
  }

  function addFavorite(item) {
    const exists = favorites.find((f) => f.url === item.url);
    if (!exists) {
      setFavorites((f) => [...f, { ...item, id: Date.now(), tags: [] }]);
    }
  }

  function removeFavorite(id) {
    setFavorites((f) => f.filter((fav) => fav.id !== id));
  }
  async function downloadImage(url, name) {
    try {
      // Fetch the image as a blob
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("Failed to fetch image");
      const blob = await res.blob();

      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a hidden link to trigger download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name || "pet-image.jpg";
      a.style.display = "none"; // hide link
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release the object URL
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Failed to download image. Try refreshing.");
      console.error(err);
    }
  }

  function openInNewTab(url) {
    window.open(url, "_blank");
  }

  function addTag(id, tag) {
    setFavorites((f) =>
      f.map((fav) =>
        fav.id === id ? { ...fav, tags: [...new Set([...fav.tags, tag])] } : fav
      )
    );
  }

  function removeTag(id, tag) {
    setFavorites((f) =>
      f.map((fav) =>
        fav.id === id
          ? { ...fav, tags: fav.tags.filter((t) => t !== tag) }
          : fav
      )
    );
  }

  function handleDragStart(index) {
    setDraggedIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFavorites = [...favorites];
    const draggedItem = newFavorites[draggedIndex];
    newFavorites.splice(draggedIndex, 1);
    newFavorites.splice(index, 0, draggedItem);

    setFavorites(newFavorites);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  const tagOptions = ["cute", "funny", "sleepy", "playful", "majestic"];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f3ff 0%, #dbeafe 100%);
          padding: 2rem;
        }
        
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header {
          margin-bottom: 2rem;
        }
        
        .title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }
        
        .subtitle {
          color: #6b7280;
          margin: 0;
        }
        
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .pets-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        @media (min-width: 768px) {
          .pets-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .pet-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: box-shadow 0.3s ease;
        }
        
        .pet-card:hover {
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
        }
        
        .pet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        
        .pet-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }
        
        .refresh-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .refresh-btn:hover {
          background: #f3f4f6;
        }
        
        .breed-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          margin-bottom: 1rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .breed-select:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
        }
        
        .spacer {
          height: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .image-container {
          position: relative;
          background: #f3f4f6;
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 1 / 1;
        }
        
        .loading-skeleton {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .loading-text {
          color: #9ca3af;
        }
        
        .pet-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .image-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }
        
        .image-container:hover .image-overlay {
          background: rgba(0, 0, 0, 0.4);
        }
        
        .overlay-text {
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .image-container:hover .overlay-text {
          opacity: 1;
        }
        
        .breed-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          padding: 1rem;
        }
        
        .breed-name {
          color: white;
          font-weight: 600;
          text-transform: capitalize;
          margin: 0;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .primary-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
          color: white;
        }
        
        .btn-dog {
          background: #a855f7;
        }
        
        .btn-dog:hover {
          background: #9333ea;
        }
        
        .btn-cat {
          background: #3b82f6;
        }
        
        .btn-cat:hover {
          background: #2563eb;
        }
        
        .icon-btn {
          padding: 0.5rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .icon-btn:hover {
          background: #f9fafb;
        }
        
        .favorites-section {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .favorites-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 1.5rem 0;
        }
        
        .empty-favorites {
          text-align: center;
          padding: 3rem 0;
          color: #6b7280;
        }
        
        .empty-icon {
          width: 4rem;
          height: 4rem;
          margin: 0 auto 1rem;
          color: #d1d5db;
        }
        
        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        @media (min-width: 640px) {
          .favorites-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (min-width: 768px) {
          .favorites-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .favorites-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        
        .favorite-card {
          position: relative;
          background: #f9fafb;
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: move;
          transition: box-shadow 0.3s ease;
        }
        
        .favorite-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .favorite-image-wrapper {
          position: relative;
          aspect-ratio: 1 / 1;
        }
        
        .remove-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          padding: 0.25rem;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease, background 0.3s ease;
        }
        
        .favorite-card:hover .remove-btn {
          opacity: 1;
        }
        
        .remove-btn:hover {
          background: #dc2626;
        }
        
        .favorite-details {
          padding: 0.5rem;
        }
        
        .favorite-breed {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
          text-transform: capitalize;
          margin: 0 0 0.5rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        
        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: #f3e8ff;
          color: #7c3aed;
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
        }
        
        .tag-remove {
          background: transparent;
          border: none;
          color: #7c3aed;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.3s ease;
        }
        
        .tag-remove:hover {
          color: #5b21b6;
        }
        
        .tag-select {
          width: 100%;
          font-size: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .tag-select:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 1px #a855f7;
        }
        .breed-select {
          max-height: 100px; /* limit visible height */
          overflow-y: auto;  /* allow scrolling */
          }

      `}</style>

      <div className="container">
        <div className="main-content">
          <div className="header">
            <h1 className="title">🐾 Pet Gallery</h1>
            <p className="subtitle">
              Discover adorable dogs and cats, save your favorites!
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="pets-grid">
            {/* Dog Section */}
            <div className="pet-card">
              <div className="pet-header">
                <h2 className="pet-title">🐕 Dogs</h2>
                <button
                  onClick={() => fetchDog(breed)}
                  className="refresh-btn"
                  aria-label="Refresh dog image"
                >
                  <RefreshCw
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>
              </div>

              <select
                value={breed}
                onChange={(e) => {
                  setBreed(e.target.value);
                  fetchDog(e.target.value);
                }}
                className="breed-select"
              >
                <option value="">Random Breed</option>
                {breeds.map((b) => (
                  <option key={b} value={b}>
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                  </option>
                ))}
              </select>

              <div className="image-container" onClick={() => fetchDog(breed)}>
                {imageLoading.dog && (
                  <div className="loading-skeleton">
                    <div className="loading-text">Loading...</div>
                  </div>
                )}
                {dog && (
                  <>
                    <img
                      src={dog.url}
                      alt={`A ${dog.breed} dog`}
                      className="pet-image"
                      onLoad={() =>
                        setImageLoading((prev) => ({ ...prev, dog: false }))
                      }
                    />
                    <div className="image-overlay">
                      <span className="overlay-text">Click to refresh</span>
                    </div>
                    <div className="breed-label">
                      <p className="breed-name">{dog.breed}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="action-buttons">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dog && addFavorite(dog);
                  }}
                  className="primary-btn btn-dog"
                >
                  <Heart style={{ width: "16px", height: "16px" }} /> Add to
                  Favorites
                </button>

                <button
                  onClick={() =>
                    dog && downloadImage(dog.url, `dog-${dog.breed}.jpg`)
                  }
                  className="icon-btn"
                  aria-label="Download image"
                >
                  <Download
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>

                <button
                  onClick={() => dog && openInNewTab(dog.url)}
                  className="icon-btn"
                  aria-label="Open in new tab"
                >
                  <ExternalLink
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>
              </div>
            </div>

            {/* Cat Section */}
            <div className="pet-card">
              <div className="pet-header">
                <h2 className="pet-title">🐈 Cats</h2>
                <button
                  onClick={() => fetchCat(selectedCatBreed)}
                  className="refresh-btn"
                  aria-label="Refresh cat image"
                >
                  <RefreshCw
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>
              </div>

              <select
                value={selectedCatBreed}
                onChange={(e) => {
                  setSelectedCatBreed(e.target.value);
                  fetchCat(e.target.value);
                }}
                className="breed-select"
              >
                <option value="">Random Cat</option>
                {catBreeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <div
                className="image-container"
                onClick={() => fetchCat(selectedCatBreed)}
              >
                {imageLoading.cat && (
                  <div className="loading-skeleton">
                    <div className="loading-text">Loading...</div>
                  </div>
                )}
                {cat && (
                  <>
                    <img
                      src={cat.url}
                      alt={`A ${cat.breed} cat`}
                      className="pet-image"
                      onLoad={() =>
                        setImageLoading((prev) => ({ ...prev, cat: false }))
                      }
                    />
                    <div className="image-overlay">
                      <span className="overlay-text">Click to refresh</span>
                    </div>
                    <div className="breed-label">
                      <p className="breed-name">{cat.breed}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="action-buttons">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cat && addFavorite(cat);
                  }}
                  className="primary-btn btn-cat"
                >
                  <Heart style={{ width: "16px", height: "16px" }} /> Add to
                  Favorites
                </button>
                <button
                  onClick={() => {
                    if (!cat?.url) return alert("No cat image to download");
                    const safeBreed = cat.breed.replace(/\s+/g, "-");
                    const a = document.createElement("a");
                    a.href = cat.url; // use URL directly
                    a.download = `cat-${safeBreed}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="icon-btn"
                >
                  <Download
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>

                <button
                  onClick={() => cat && openInNewTab(cat.url)}
                  className="icon-btn"
                  aria-label="Open in new tab"
                >
                  <ExternalLink
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          <div className="favorites-section">
            <h2 className="favorites-title">
              ❤️ Your Favorites ({favorites.length})
            </h2>

            {favorites.length === 0 ? (
              <div className="empty-favorites">
                <Heart className="empty-icon" />
                <p>
                  No favorites yet! Click on any pet image to add it to your
                  collection.
                </p>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map((fav, index) => (
                  <div
                    key={fav.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="favorite-card"
                  >
                    <div className="favorite-image-wrapper">
                      <img
                        src={fav.url}
                        alt={`Favorite ${fav.breed}`}
                        className="pet-image"
                      />
                      <button
                        onClick={() => removeFavorite(fav.id)}
                        className="remove-btn"
                        aria-label="Remove from favorites"
                      >
                        <X style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>

                    <div className="favorite-details">
                      <p className="favorite-breed">{fav.breed}</p>

                      <div className="tags-container">
                        {fav.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                            <button
                              onClick={() => removeTag(fav.id, tag)}
                              className="tag-remove"
                            >
                              <X style={{ width: "12px", height: "12px" }} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addTag(fav.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="tag-select"
                      >
                        <option value="">+ Add tag</option>
                        {tagOptions
                          .filter((t) => !fav.tags.includes(t))
                          .map((tag) => (
                            <option key={tag} value={tag}>
                              {tag}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
