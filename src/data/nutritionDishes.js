// Per-serving nutrition estimates. Most users of this app are expected to
// eat Iraqi home cooking day-to-day, so that's the primary, most complete
// list — plus a short list of other common staples people log alongside
// those meals. Every number here is a single representative estimate
// (typically the midpoint of a normal serving-size range), not a lab
// measurement — same "clearly an estimate" spirit as calorie-burn in
// lib/estimate.js. Fiber isn't something typically printed on a menu, so
// it's estimated from each dish's known ingredients (legumes/okra/whole
// grains push it up, refined rice/meat push it down).

export const IRAQI_DISHES = [
  { id: 'bamya', name: 'Bamya (okra stew with beef)', emoji: '🍲', serving: '1.5 cups', calories: 400, protein: 28, carbs: 30, fat: 19, fiber: 6 },
  { id: 'riza-maraka', name: 'Riza Maraka (rice + stew)', emoji: '🍚', serving: '1 cup rice + 1 cup stew', calories: 625, protein: 30, carbs: 80, fat: 20, fiber: 4 },
  { id: 'dolma-beef', name: 'Dolma with beef', emoji: '🫑', serving: '10 oz', calories: 475, protein: 25, carbs: 53, fat: 20, fiber: 6 },
  { id: 'dolma-rice', name: 'Dolma, rice-heavy', emoji: '🫑', serving: '10 oz', calories: 400, protein: 14, carbs: 63, fat: 14, fiber: 5 },
  { id: 'tashreeb', name: 'Tashreeb', emoji: '🍞', serving: '1 large bowl', calories: 600, protein: 30, carbs: 65, fat: 24, fiber: 4 },
  { id: 'kubbah-fried', name: 'Kubbah (fried)', emoji: '🥟', serving: '2 pieces', calories: 400, protein: 18, carbs: 35, fat: 22, fiber: 3 },
  { id: 'kubbah-boiled', name: 'Kubbah, boiled', emoji: '🥟', serving: '2 pieces', calories: 315, protein: 18, carbs: 38, fat: 10, fiber: 3 },
  { id: 'qeema', name: 'Qeema / Keema', emoji: '🍛', serving: '1 cup', calories: 400, protein: 30, carbs: 15, fat: 24, fiber: 2 },
  { id: 'biryani', name: 'Biryani Iraqi style', emoji: '🍛', serving: '2 cups', calories: 700, protein: 30, carbs: 88, fat: 25, fiber: 3 },
  { id: 'chicken-shorba', name: 'Chicken shorba', emoji: '🍜', serving: '2 cups', calories: 300, protein: 30, carbs: 25, fat: 12, fiber: 3 },
  { id: 'lentil-shorba', name: 'Lentil shorba', emoji: '🍜', serving: '2 cups', calories: 350, protein: 18, carbs: 50, fat: 8, fiber: 9 },
  { id: 'fasolia', name: 'Fasolia (white bean stew + beef)', emoji: '🫘', serving: '1.5 cups', calories: 450, protein: 30, carbs: 40, fat: 19, fiber: 11 },
  { id: 'tashreeb-dajaj', name: 'Tashreeb dajaj (chicken)', emoji: '🍞', serving: '1 large bowl', calories: 525, protein: 35, carbs: 55, fat: 17, fiber: 4 },
  { id: 'masgouf', name: 'Masgouf', emoji: '🐟', serving: '8 oz fish', calories: 425, protein: 50, carbs: 10, fat: 20, fiber: 0 },
  { id: 'chicken-rice', name: 'Chicken with rice', emoji: '🍗', serving: '8 oz chicken + 1 cup rice', calories: 600, protein: 55, carbs: 50, fat: 16, fiber: 2 },
  { id: 'kabab', name: 'Kabab Iraqi', emoji: '🍢', serving: '6 oz', calories: 400, protein: 38, carbs: 8, fat: 24, fiber: 1 },
  { id: 'kubba-halab', name: 'Kubba halab (rice kubba)', emoji: '🥟', serving: '2 pieces', calories: 400, protein: 15, carbs: 50, fat: 19, fiber: 3 },
  { id: 'shawarma', name: 'Shawarma Iraqi style', emoji: '🌯', serving: '1 sandwich', calories: 600, protein: 35, carbs: 58, fat: 24, fiber: 4 },
  { id: 'falafel', name: 'Falafel', emoji: '🧆', serving: '5 pieces', calories: 350, protein: 15, carbs: 35, fat: 19, fiber: 7 },
  { id: 'hummus', name: 'Hummus', emoji: '🫓', serving: '4 oz', calories: 225, protein: 8, carbs: 18, fat: 14, fiber: 5 },
  { id: 'mtabbal', name: 'Mtabbal / Baba ghanoush', emoji: '🍆', serving: '4 oz', calories: 160, protein: 4, carbs: 10, fat: 12, fiber: 4 },
  { id: 'tabbouleh', name: 'Tabbouleh', emoji: '🥗', serving: '1 cup', calories: 175, protein: 4, carbs: 20, fat: 10, fiber: 5 },
  { id: 'pickles', name: 'Iraqi pickles', emoji: '🥒', serving: '2 oz', calories: 20, protein: 1, carbs: 4, fat: 0, fiber: 1 },
]

export const OTHER_DISHES = [
  { id: 'samoon', name: 'Flatbread (samoon / khubz)', emoji: '🍞', serving: '1 piece', calories: 200, protein: 6, carbs: 40, fat: 2, fiber: 2 },
  { id: 'plain-rice', name: 'Plain white rice', emoji: '🍚', serving: '1 cup', calories: 205, protein: 4, carbs: 45, fat: 1, fiber: 1 },
  { id: 'laban', name: 'Laban (yogurt drink)', emoji: '🥛', serving: '1 cup', calories: 120, protein: 6, carbs: 10, fat: 5, fiber: 0 },
  { id: 'fruit', name: 'Fresh fruit', emoji: '🍎', serving: '1 piece', calories: 80, protein: 1, carbs: 20, fat: 0, fiber: 3 },
  { id: 'salad', name: 'Mixed green salad', emoji: '🥗', serving: '1.5 cups', calories: 90, protein: 2, carbs: 8, fat: 5, fiber: 3 },
  { id: 'chai', name: 'Chai tea (with sugar)', emoji: '🍵', serving: '1 cup', calories: 60, protein: 1, carbs: 12, fat: 1, fiber: 0 },
]

export const ALL_DISHES = [...IRAQI_DISHES, ...OTHER_DISHES]

export function findDish(id) {
  return ALL_DISHES.find((d) => d.id === id) || null
}
