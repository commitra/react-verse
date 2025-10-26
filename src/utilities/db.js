import { openDB } from 'idb';

const DB_NAME = 'movie-db';
const STORE_NAME = 'movies';
const DB_VERSION = 1;

async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  return db;
}

/**
 * Gets all movies from the IndexedDB cache.
 * @returns {Promise<Array>} A promise that resolves to an array of movie objects.
 */
export async function getCachedMovies() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

/**
 * Saves an array of movies to the IndexedDB cache.
 * It clears the old data and adds the new data.
 * @param {Array} movies - An array of movie objects to cache.
 */
export async function saveMoviesToCache(movies) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  
  await tx.objectStore(STORE_NAME).clear();
  
  await Promise.all(movies.map(movie => {
    return tx.objectStore(STORE_NAME).add(movie);
  }));
  
  await tx.done;
}
