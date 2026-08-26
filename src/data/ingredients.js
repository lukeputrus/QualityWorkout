// Common ingredients for the "build a meal from ingredients" flow. Values
// are per 100g, same estimate spirit as everything else in this app (not
// lab-measured) — reasonable standard nutrition-label figures for each
// ingredient in the state described (raw vs cooked matters a lot for
// calorie density, so that's called out in the name where it does).

export const INGREDIENT_CATEGORIES = [
  'Protein',
  'Grains & Starches',
  'Legumes & Nuts',
  'Vegetables',
  'Fruits',
  'Dairy & Eggs',
  'Fats & Oils',
  'Condiments & Sauces',
]

export const INGREDIENTS = [
  // Protein
  { id: 'chicken-breast', name: 'Chicken breast (cooked, skinless)', category: 'Protein', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'chicken-thigh', name: 'Chicken thigh (cooked, skinless)', category: 'Protein', emoji: '🍗', calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
  { id: 'ground-beef-85', name: 'Ground beef, 85% lean (cooked)', category: 'Protein', emoji: '🥩', calories: 250, protein: 25.9, carbs: 0, fat: 16.2, fiber: 0 },
  { id: 'beef-steak', name: 'Beef steak, sirloin (cooked)', category: 'Protein', emoji: '🥩', calories: 206, protein: 29, carbs: 0, fat: 9, fiber: 0 },
  { id: 'lamb', name: 'Lamb (cooked)', category: 'Protein', emoji: '🍖', calories: 258, protein: 25.6, carbs: 0, fat: 16.5, fiber: 0 },
  { id: 'ground-turkey', name: 'Ground turkey (cooked)', category: 'Protein', emoji: '🦃', calories: 189, protein: 27, carbs: 0, fat: 8, fiber: 0 },
  { id: 'salmon', name: 'Salmon (cooked)', category: 'Protein', emoji: '🐟', calories: 208, protein: 22.1, carbs: 0, fat: 12.4, fiber: 0 },
  { id: 'tuna-canned', name: 'Tuna, canned in water', category: 'Protein', emoji: '🐟', calories: 116, protein: 25.5, carbs: 0, fat: 0.8, fiber: 0 },
  { id: 'shrimp', name: 'Shrimp (cooked)', category: 'Protein', emoji: '🦐', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  { id: 'white-fish', name: 'White fish, e.g. tilapia (cooked)', category: 'Protein', emoji: '🐟', calories: 128, protein: 26.2, carbs: 0, fat: 2.7, fiber: 0 },
  { id: 'tofu', name: 'Tofu, firm', category: 'Protein', emoji: '🧊', calories: 144, protein: 15.7, carbs: 3.3, fat: 8.7, fiber: 2.3 },
  { id: 'egg', name: 'Egg, whole (cooked)', category: 'Protein', emoji: '🥚', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  { id: 'egg-white', name: 'Egg white (cooked)', category: 'Protein', emoji: '🥚', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: 'bacon', name: 'Bacon (cooked)', category: 'Protein', emoji: '🥓', calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0 },

  // Grains & Starches
  { id: 'white-rice', name: 'White rice (cooked)', category: 'Grains & Starches', emoji: '🍚', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  { id: 'brown-rice', name: 'Brown rice (cooked)', category: 'Grains & Starches', emoji: '🍚', calories: 123, protein: 2.7, carbs: 25.6, fat: 1, fiber: 1.6 },
  { id: 'pasta', name: 'Pasta (cooked)', category: 'Grains & Starches', emoji: '🍝', calories: 158, protein: 5.8, carbs: 30.9, fat: 0.9, fiber: 1.8 },
  { id: 'bread-white', name: 'Bread, white', category: 'Grains & Starches', emoji: '🍞', calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  { id: 'bread-whole-wheat', name: 'Bread, whole wheat', category: 'Grains & Starches', emoji: '🍞', calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 6.8 },
  { id: 'potato', name: 'Potato, boiled', category: 'Grains & Starches', emoji: '🥔', calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, fiber: 1.8 },
  { id: 'sweet-potato', name: 'Sweet potato, baked', category: 'Grains & Starches', emoji: '🍠', calories: 90, protein: 2, carbs: 20.7, fat: 0.2, fiber: 3.3 },
  { id: 'quinoa', name: 'Quinoa (cooked)', category: 'Grains & Starches', emoji: '🌾', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { id: 'oats', name: 'Oats (cooked/oatmeal, plain)', category: 'Grains & Starches', emoji: '🥣', calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7 },
  { id: 'tortilla-flour', name: 'Tortilla, flour', category: 'Grains & Starches', emoji: '🫓', calories: 312, protein: 8.2, carbs: 51, fat: 8, fiber: 3 },
  { id: 'tortilla-corn', name: 'Tortilla, corn', category: 'Grains & Starches', emoji: '🫓', calories: 218, protein: 5.7, carbs: 44.6, fat: 2.8, fiber: 6.3 },
  { id: 'noodles-egg', name: 'Egg noodles (cooked)', category: 'Grains & Starches', emoji: '🍜', calories: 138, protein: 4.5, carbs: 25, fat: 2.1, fiber: 1.2 },
  { id: 'corn', name: 'Corn, sweet (cooked)', category: 'Grains & Starches', emoji: '🌽', calories: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.4 },

  // Legumes & Nuts
  { id: 'chickpeas', name: 'Chickpeas, cooked', category: 'Legumes & Nuts', emoji: '🫘', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },
  { id: 'black-beans', name: 'Black beans, cooked', category: 'Legumes & Nuts', emoji: '🫘', calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7 },
  { id: 'kidney-beans', name: 'Kidney beans, cooked', category: 'Legumes & Nuts', emoji: '🫘', calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4 },
  { id: 'lentils', name: 'Lentils, cooked', category: 'Legumes & Nuts', emoji: '🫘', calories: 116, protein: 9, carbs: 20.1, fat: 0.4, fiber: 7.9 },
  { id: 'almonds', name: 'Almonds', category: 'Legumes & Nuts', emoji: '🌰', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 },
  { id: 'walnuts', name: 'Walnuts', category: 'Legumes & Nuts', emoji: '🌰', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { id: 'peanuts', name: 'Peanuts', category: 'Legumes & Nuts', emoji: '🥜', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
  { id: 'peanut-butter', name: 'Peanut butter', category: 'Legumes & Nuts', emoji: '🥜', calories: 588, protein: 25.1, carbs: 20, fat: 50, fiber: 6 },

  // Vegetables
  { id: 'broccoli', name: 'Broccoli, cooked', category: 'Vegetables', emoji: '🥦', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { id: 'spinach', name: 'Spinach, cooked', category: 'Vegetables', emoji: '🥬', calories: 23, protein: 3, carbs: 3.8, fat: 0.3, fiber: 2.4 },
  { id: 'tomato', name: 'Tomato, raw', category: 'Vegetables', emoji: '🍅', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: 'onion', name: 'Onion, raw', category: 'Vegetables', emoji: '🧅', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  { id: 'bell-pepper', name: 'Bell pepper, raw', category: 'Vegetables', emoji: '🫑', calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { id: 'carrot', name: 'Carrot, raw', category: 'Vegetables', emoji: '🥕', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
  { id: 'cucumber', name: 'Cucumber, raw', category: 'Vegetables', emoji: '🥒', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: 'zucchini', name: 'Zucchini, cooked', category: 'Vegetables', emoji: '🥒', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
  { id: 'mushroom', name: 'Mushroom, cooked', category: 'Vegetables', emoji: '🍄', calories: 28, protein: 2.2, carbs: 5.3, fat: 0.5, fiber: 2 },
  { id: 'cabbage', name: 'Cabbage, raw', category: 'Vegetables', emoji: '🥬', calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
  { id: 'okra', name: 'Okra, cooked', category: 'Vegetables', emoji: '🫛', calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, fiber: 3.2 },
  { id: 'eggplant', name: 'Eggplant, cooked', category: 'Vegetables', emoji: '🍆', calories: 35, protein: 0.8, carbs: 8.6, fat: 0.2, fiber: 2.5 },
  { id: 'green-beans', name: 'Green beans, cooked', category: 'Vegetables', emoji: '🫛', calories: 35, protein: 1.9, carbs: 7.9, fat: 0.3, fiber: 3.4 },
  { id: 'peas', name: 'Peas, cooked', category: 'Vegetables', emoji: '🟢', calories: 84, protein: 5.4, carbs: 15.6, fat: 0.4, fiber: 5.5 },
  { id: 'lettuce', name: 'Lettuce, raw', category: 'Vegetables', emoji: '🥬', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  { id: 'garlic', name: 'Garlic, raw', category: 'Vegetables', emoji: '🧄', calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1 },

  // Fruits
  { id: 'apple', name: 'Apple, raw', category: 'Fruits', emoji: '🍎', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  { id: 'banana', name: 'Banana, raw', category: 'Fruits', emoji: '🍌', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { id: 'orange', name: 'Orange, raw', category: 'Fruits', emoji: '🍊', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
  { id: 'grapes', name: 'Grapes, raw', category: 'Fruits', emoji: '🍇', calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9 },
  { id: 'strawberries', name: 'Strawberries, raw', category: 'Fruits', emoji: '🍓', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
  { id: 'mango', name: 'Mango, raw', category: 'Fruits', emoji: '🥭', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  { id: 'dates', name: 'Dates, dried', category: 'Fruits', emoji: '🌴', calories: 282, protein: 2.5, carbs: 75, fat: 0.4, fiber: 8 },
  { id: 'avocado', name: 'Avocado, raw', category: 'Fruits', emoji: '🥑', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { id: 'watermelon', name: 'Watermelon, raw', category: 'Fruits', emoji: '🍉', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4 },

  // Dairy & Eggs
  { id: 'milk-whole', name: 'Milk, whole', category: 'Dairy & Eggs', emoji: '🥛', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  { id: 'yogurt-plain', name: 'Yogurt, plain', category: 'Dairy & Eggs', emoji: '🥣', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
  { id: 'greek-yogurt', name: 'Greek yogurt, plain', category: 'Dairy & Eggs', emoji: '🥣', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
  { id: 'cheddar', name: 'Cheddar cheese', category: 'Dairy & Eggs', emoji: '🧀', calories: 403, protein: 24.9, carbs: 1.3, fat: 33.1, fiber: 0 },
  { id: 'feta', name: 'Feta cheese', category: 'Dairy & Eggs', emoji: '🧀', calories: 264, protein: 14.2, carbs: 4.1, fat: 21.3, fiber: 0 },
  { id: 'mozzarella', name: 'Mozzarella cheese', category: 'Dairy & Eggs', emoji: '🧀', calories: 280, protein: 27.5, carbs: 3.1, fat: 17.1, fiber: 0 },
  { id: 'cottage-cheese', name: 'Cottage cheese', category: 'Dairy & Eggs', emoji: '🧀', calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: 'parmesan', name: 'Parmesan cheese', category: 'Dairy & Eggs', emoji: '🧀', calories: 431, protein: 38.5, carbs: 4.1, fat: 29, fiber: 0 },

  // Fats & Oils
  { id: 'olive-oil', name: 'Olive oil', category: 'Fats & Oils', emoji: '🫒', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: 'butter', name: 'Butter', category: 'Fats & Oils', emoji: '🧈', calories: 717, protein: 0.9, carbs: 0.1, fat: 81.1, fiber: 0 },
  { id: 'vegetable-oil', name: 'Vegetable oil', category: 'Fats & Oils', emoji: '🫙', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },

  // Condiments & Sauces
  { id: 'soy-sauce', name: 'Soy sauce', category: 'Condiments & Sauces', emoji: '🥢', calories: 53, protein: 8, carbs: 4.9, fat: 0.6, fiber: 0.8 },
  { id: 'tahini', name: 'Tahini', category: 'Condiments & Sauces', emoji: '🫙', calories: 595, protein: 17, carbs: 21.2, fat: 53.8, fiber: 9.3 },
  { id: 'mayonnaise', name: 'Mayonnaise', category: 'Condiments & Sauces', emoji: '🫙', calories: 680, protein: 1, carbs: 0.6, fat: 75, fiber: 0 },
  { id: 'ketchup', name: 'Ketchup', category: 'Condiments & Sauces', emoji: '🍅', calories: 101, protein: 1.3, carbs: 25.8, fat: 0.1, fiber: 0.3 },
  { id: 'honey', name: 'Honey', category: 'Condiments & Sauces', emoji: '🍯', calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2 },
  { id: 'sugar', name: 'Sugar, white', category: 'Condiments & Sauces', emoji: '🧂', calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  { id: 'tomato-sauce', name: 'Tomato sauce', category: 'Condiments & Sauces', emoji: '🍅', calories: 29, protein: 1.3, carbs: 6.6, fat: 0.2, fiber: 1.5 },
  { id: 'salsa', name: 'Salsa', category: 'Condiments & Sauces', emoji: '🌶️', calories: 36, protein: 1.5, carbs: 7.6, fat: 0.2, fiber: 1.8 },
]

export function findIngredient(id) {
  return INGREDIENTS.find((i) => i.id === id) || null
}
