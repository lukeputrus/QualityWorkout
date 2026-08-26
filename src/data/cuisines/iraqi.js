// Nutrition per 100g of the prepared dish, plus a realistic single-serving
// weight in grams (typicalGrams) used to prefill the quantity field — the
// user can still type any gram/oz amount they actually ate. Converted from
// the app's original per-serving estimates (see git history), so ids are
// unchanged on purpose: FIBER_BOOST_DISHES and any meal a user already
// logged reference these ids directly.
export const IRAQI_DISHES = [
  { id: 'bamya', name: 'Bamya (okra stew with beef)', emoji: '🍲', typicalGrams: 375, calories: 107, protein: 7, carbs: 8, fat: 5, fiber: 2 },
  { id: 'riza-maraka', name: 'Riza Maraka (rice + stew)', emoji: '🍚', typicalGrams: 400, calories: 156, protein: 8, carbs: 20, fat: 5, fiber: 1 },
  { id: 'dolma-beef', name: 'Dolma with beef', emoji: '🫑', typicalGrams: 283, calories: 168, protein: 9, carbs: 19, fat: 7, fiber: 2 },
  { id: 'dolma-rice', name: 'Dolma, rice-heavy', emoji: '🫑', typicalGrams: 283, calories: 141, protein: 5, carbs: 22, fat: 5, fiber: 2 },
  { id: 'tashreeb', name: 'Tashreeb', emoji: '🍞', typicalGrams: 450, calories: 133, protein: 7, carbs: 14, fat: 5, fiber: 1 },
  { id: 'kubbah-fried', name: 'Kubbah (fried)', emoji: '🥟', typicalGrams: 140, calories: 286, protein: 13, carbs: 25, fat: 16, fiber: 2 },
  { id: 'kubbah-boiled', name: 'Kubbah, boiled', emoji: '🥟', typicalGrams: 140, calories: 225, protein: 13, carbs: 27, fat: 7, fiber: 2 },
  { id: 'qeema', name: 'Qeema / Keema', emoji: '🍛', typicalGrams: 220, calories: 182, protein: 14, carbs: 7, fat: 11, fiber: 1 },
  { id: 'biryani', name: 'Biryani Iraqi style', emoji: '🍛', typicalGrams: 340, calories: 206, protein: 9, carbs: 26, fat: 7, fiber: 1 },
  { id: 'chicken-shorba', name: 'Chicken shorba', emoji: '🍜', typicalGrams: 480, calories: 63, protein: 6, carbs: 5, fat: 3, fiber: 1 },
  { id: 'lentil-shorba', name: 'Lentil shorba', emoji: '🍜', typicalGrams: 480, calories: 73, protein: 4, carbs: 10, fat: 2, fiber: 2 },
  { id: 'fasolia', name: 'Fasolia (white bean stew + beef)', emoji: '🫘', typicalGrams: 375, calories: 120, protein: 8, carbs: 11, fat: 5, fiber: 3 },
  { id: 'tashreeb-dajaj', name: 'Tashreeb dajaj (chicken)', emoji: '🍞', typicalGrams: 480, calories: 109, protein: 7, carbs: 12, fat: 4, fiber: 1 },
  { id: 'masgouf', name: 'Masgouf', emoji: '🐟', typicalGrams: 227, calories: 187, protein: 22, carbs: 4, fat: 9, fiber: 0 },
  { id: 'chicken-rice', name: 'Chicken with rice', emoji: '🍗', typicalGrams: 385, calories: 156, protein: 14, carbs: 13, fat: 4, fiber: 1 },
  { id: 'kabab', name: 'Kabab Iraqi', emoji: '🍢', typicalGrams: 170, calories: 235, protein: 22, carbs: 5, fat: 14, fiber: 1 },
  { id: 'kubba-halab', name: 'Kubba halab (rice kubba)', emoji: '🥟', typicalGrams: 180, calories: 222, protein: 8, carbs: 28, fat: 11, fiber: 2 },
  { id: 'shawarma', name: 'Shawarma Iraqi style', emoji: '🌯', typicalGrams: 280, calories: 214, protein: 13, carbs: 21, fat: 9, fiber: 1 },
  { id: 'falafel', name: 'Falafel', emoji: '🧆', typicalGrams: 100, calories: 350, protein: 15, carbs: 35, fat: 19, fiber: 7 },
  { id: 'hummus', name: 'Hummus', emoji: '🫓', typicalGrams: 113, calories: 199, protein: 7, carbs: 16, fat: 12, fiber: 4 },
  { id: 'mtabbal', name: 'Mtabbal / Baba ghanoush', emoji: '🍆', typicalGrams: 113, calories: 142, protein: 4, carbs: 9, fat: 11, fiber: 4 },
  { id: 'tabbouleh', name: 'Tabbouleh', emoji: '🥗', typicalGrams: 150, calories: 117, protein: 3, carbs: 13, fat: 7, fiber: 3 },
  { id: 'pickles', name: 'Iraqi pickles', emoji: '🥒', typicalGrams: 57, calories: 35, protein: 2, carbs: 7, fat: 0, fiber: 2 },
  { id: 'samoon', name: 'Flatbread (samoon / khubz)', emoji: '🍞', typicalGrams: 90, calories: 222, protein: 7, carbs: 44, fat: 2, fiber: 2 },
  { id: 'plain-rice', name: 'Plain white rice', emoji: '🍚', typicalGrams: 158, calories: 130, protein: 3, carbs: 28, fat: 1, fiber: 1 },
  { id: 'laban', name: 'Laban (yogurt drink)', emoji: '🥛', typicalGrams: 245, calories: 49, protein: 2, carbs: 4, fat: 2, fiber: 0 },
  { id: 'fruit', name: 'Fresh fruit', emoji: '🍎', typicalGrams: 150, calories: 53, protein: 1, carbs: 13, fat: 0, fiber: 2 },
  { id: 'salad', name: 'Mixed green salad', emoji: '🥗', typicalGrams: 120, calories: 75, protein: 2, carbs: 7, fat: 4, fiber: 3 },
  { id: 'chai', name: 'Chai tea (with sugar)', emoji: '🍵', typicalGrams: 240, calories: 20, protein: 0, carbs: 5, fat: 0, fiber: 0 },
]
