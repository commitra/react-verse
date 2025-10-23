const cache = new Map();

const getEnv = () => ({
  appId: import.meta.env.VITE_EDAMAM_APP_ID,
  appKey: import.meta.env.VITE_EDAMAM_APP_KEY,
});

const getRapidEnv = () => ({
  rapidKey: import.meta.env.VITE_RAPIDAPI_KEY,
  rapidHost: import.meta.env.VITE_RAPIDAPI_HOST,
});

const normalize = (apiResponse) => {
  if (!apiResponse) return null;
  const n = apiResponse.totalNutrients || {};
  return {
    calories: Math.round(apiResponse.calories || 0),
    weight: Math.round(apiResponse.totalWeight || 0),
    proteinG: Math.round((n.PROCNT?.quantity || 0)),
    carbsG: Math.round((n.CHOCDF?.quantity || 0)),
    fatG: Math.round((n.FAT?.quantity || 0)),
    sugarG: Math.round((n.SUGAR?.quantity || 0)),
    sodiumMg: Math.round((n.NA?.quantity || 0)),
    fiberG: Math.round((n.FIBTG?.quantity || 0)),
    raw: apiResponse,
  };
};

const ingredientsKey = (ingredients) => ingredients.map((s) => s.trim().toLowerCase()).sort().join('\n');

export async function estimateNutritionForIngredients(ingredients) {
  const { appId, appKey } = getEnv();
  const { rapidKey, rapidHost } = getRapidEnv();
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null;

  const key = ingredientsKey(ingredients);
  if (cache.has(key)) return cache.get(key);

  // Prefer RapidAPI if configured
  if (rapidKey && rapidHost) {
    const isMulti = ingredients.length > 1;
    const nutritionType = isMulti ? 'cooking' : 'logging';
    const ingrString = isMulti ? ingredients.join(', ') : String(ingredients[0]);
    const base = `https://${rapidHost}`;
    const paths = [
      `/api/nutrition-details?ingr=${encodeURIComponent(ingrString)}&nutrition-type=${nutritionType}`,
      `/api/nutrition-data?ingr=${encodeURIComponent(ingrString)}&nutrition-type=${nutritionType}`,
    ];
    for (const p of paths) {
      const res = await fetch(`${base}${p}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidKey,
          'x-rapidapi-host': rapidHost,
        }
      });
      if (res.ok) {
        const json = await res.json();
        const normalized = normalize(json);
        cache.set(key, normalized);
        return normalized;
      }
      if (res.status !== 404) {
        throw new Error('Failed to fetch nutrition');
      }
    }
    throw new Error('Nutrition endpoint not found on RapidAPI host');
  }

  // Fallback to native Edamam if configured
  if (appId && appKey) {
    const url = `/edamam/api/nutrition-details?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Recipe', ingr: ingredients }),
    });
    if (!res.ok) throw new Error('Failed to fetch nutrition');
    const json = await res.json();
    const normalized = normalize(json);
    cache.set(key, normalized);
    return normalized;
  }

  // Final fallback to mock
  const res = await fetch('/mock/nutrition-sample.json');
  if (!res.ok) return null;
  const json = await res.json();
  const normalized = normalize(json);
  cache.set(key, normalized);
  return normalized;
}

export function buildIngredientsFromMealDetail(mealDetail) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = mealDetail[`strIngredient${i}`];
    const meas = mealDetail[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const line = [meas, ing].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      list.push(line);
    }
  }
  return list;
}

export function getCacheSize() {
  return cache.size;
}


