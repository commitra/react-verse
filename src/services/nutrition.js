const cache = new Map();

const getEnv = () => ({
  appId: import.meta.env.VITE_EDAMAM_APP_ID,
  appKey: import.meta.env.VITE_EDAMAM_APP_KEY,
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
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null;

  const key = ingredientsKey(ingredients);
  if (cache.has(key)) return cache.get(key);

  if (!appId || !appKey) {
    return null;
  }

  const url = `/edamam/api/nutrition-details?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Recipe', ingr: ingredients }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch nutrition');
  }

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


