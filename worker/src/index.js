// Cloudflare Worker: receives a plate photo from the QualityWorkout web app
// and uses Claude's vision API to identify the dish and estimate its
// nutrition facts — including portion size, straight from the photo — so
// the app can log a meal without the user searching for a dish or picking
// a serving-size multiplier by hand.
//
// This has to run server-side. A vision API call needs a secret API key,
// and a key embedded in the static frontend's JS bundle would be sitting
// in plain sight for anyone who opens dev tools on the deployed site —
// same reasoning as SUBSCRIPTION_SETUP.md's "payments need a backend" note,
// just for a different secret. See worker/README.md for how to deploy this.

// Mirrors src/data/nutritionDishes.js — keep in sync if that file changes.
// Duplicated rather than imported because this Worker deploys independently
// of the Vite frontend (separate build, separate host) and doesn't share a
// bundler with it.
const CATALOG = [
  { id: 'bamya', name: 'Bamya (okra stew with beef)', serving: '1.5 cups', calories: 400, protein: 28, carbs: 30, fat: 19, fiber: 6 },
  { id: 'riza-maraka', name: 'Riza Maraka (rice + stew)', serving: '1 cup rice + 1 cup stew', calories: 625, protein: 30, carbs: 80, fat: 20, fiber: 4 },
  { id: 'dolma-beef', name: 'Dolma with beef', serving: '10 oz', calories: 475, protein: 25, carbs: 53, fat: 20, fiber: 6 },
  { id: 'dolma-rice', name: 'Dolma, rice-heavy', serving: '10 oz', calories: 400, protein: 14, carbs: 63, fat: 14, fiber: 5 },
  { id: 'tashreeb', name: 'Tashreeb', serving: '1 large bowl', calories: 600, protein: 30, carbs: 65, fat: 24, fiber: 4 },
  { id: 'kubbah-fried', name: 'Kubbah (fried)', serving: '2 pieces', calories: 400, protein: 18, carbs: 35, fat: 22, fiber: 3 },
  { id: 'kubbah-boiled', name: 'Kubbah, boiled', serving: '2 pieces', calories: 315, protein: 18, carbs: 38, fat: 10, fiber: 3 },
  { id: 'qeema', name: 'Qeema / Keema', serving: '1 cup', calories: 400, protein: 30, carbs: 15, fat: 24, fiber: 2 },
  { id: 'biryani', name: 'Biryani Iraqi style', serving: '2 cups', calories: 700, protein: 30, carbs: 88, fat: 25, fiber: 3 },
  { id: 'chicken-shorba', name: 'Chicken shorba', serving: '2 cups', calories: 300, protein: 30, carbs: 25, fat: 12, fiber: 3 },
  { id: 'lentil-shorba', name: 'Lentil shorba', serving: '2 cups', calories: 350, protein: 18, carbs: 50, fat: 8, fiber: 9 },
  { id: 'fasolia', name: 'Fasolia (white bean stew + beef)', serving: '1.5 cups', calories: 450, protein: 30, carbs: 40, fat: 19, fiber: 11 },
  { id: 'tashreeb-dajaj', name: 'Tashreeb dajaj (chicken)', serving: '1 large bowl', calories: 525, protein: 35, carbs: 55, fat: 17, fiber: 4 },
  { id: 'masgouf', name: 'Masgouf', serving: '8 oz fish', calories: 425, protein: 50, carbs: 10, fat: 20, fiber: 0 },
  { id: 'chicken-rice', name: 'Chicken with rice', serving: '8 oz chicken + 1 cup rice', calories: 600, protein: 55, carbs: 50, fat: 16, fiber: 2 },
  { id: 'kabab', name: 'Kabab Iraqi', serving: '6 oz', calories: 400, protein: 38, carbs: 8, fat: 24, fiber: 1 },
  { id: 'kubba-halab', name: 'Kubba halab (rice kubba)', serving: '2 pieces', calories: 400, protein: 15, carbs: 50, fat: 19, fiber: 3 },
  { id: 'shawarma', name: 'Shawarma Iraqi style', serving: '1 sandwich', calories: 600, protein: 35, carbs: 58, fat: 24, fiber: 4 },
  { id: 'falafel', name: 'Falafel', serving: '5 pieces', calories: 350, protein: 15, carbs: 35, fat: 19, fiber: 7 },
  { id: 'hummus', name: 'Hummus', serving: '4 oz', calories: 225, protein: 8, carbs: 18, fat: 14, fiber: 5 },
  { id: 'mtabbal', name: 'Mtabbal / Baba ghanoush', serving: '4 oz', calories: 160, protein: 4, carbs: 10, fat: 12, fiber: 4 },
  { id: 'tabbouleh', name: 'Tabbouleh', serving: '1 cup', calories: 175, protein: 4, carbs: 20, fat: 10, fiber: 5 },
  { id: 'pickles', name: 'Iraqi pickles', serving: '2 oz', calories: 20, protein: 1, carbs: 4, fat: 0, fiber: 1 },
  { id: 'samoon', name: 'Flatbread (samoon / khubz)', serving: '1 piece', calories: 200, protein: 6, carbs: 40, fat: 2, fiber: 2 },
  { id: 'plain-rice', name: 'Plain white rice', serving: '1 cup', calories: 205, protein: 4, carbs: 45, fat: 1, fiber: 1 },
  { id: 'laban', name: 'Laban (yogurt drink)', serving: '1 cup', calories: 120, protein: 6, carbs: 10, fat: 5, fiber: 0 },
  { id: 'fruit', name: 'Fresh fruit', serving: '1 piece', calories: 80, protein: 1, carbs: 20, fat: 0, fiber: 3 },
  { id: 'salad', name: 'Mixed green salad', serving: '1.5 cups', calories: 90, protein: 2, carbs: 8, fat: 5, fiber: 3 },
  { id: 'chai', name: 'Chai tea (with sugar)', serving: '1 cup', calories: 60, protein: 1, carbs: 12, fat: 1, fiber: 0 },
  { id: 'chili-beans', name: 'Chili with Beans (American)', serving: '1.5 cups', calories: 420, protein: 22, carbs: 45, fat: 16, fiber: 13 },
]

const DEFAULT_MODEL_ID = 'claude-haiku-4-5'
const MAX_DATA_URL_LENGTH = 6 * 1024 * 1024 // ~4.5MB of image data as base64; the frontend already downscales to ~480px

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Secret',
  }
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function buildPrompt() {
  return `You are a nutrition estimation assistant for a fitness app whose users mostly eat Iraqi home cooking. Look at this photo of a plate of food.

Known dish catalog (id, name, typical serving, and per-serving macros):
${JSON.stringify(CATALOG)}

Identify the dish. If it clearly matches one of the catalog entries, use that entry's macros as your baseline and scale calories/protein/carbs/fat/fiber by how the visible portion compares to its "typical serving" (a smaller portion than usual -> scale down, a heaping plate -> scale up). If it doesn't match anything in the catalog, estimate calories/protein/carbs/fat/fiber directly from general nutrition knowledge for what you see, using the portion actually visible in the photo.

Respond with ONLY valid JSON (no markdown fences, no extra text), matching exactly this shape:
{"matchedDishId": string|null, "name": string, "confidence": "low"|"medium"|"high", "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "notes": string}

"notes" should be one short sentence about the portion size or anything uncertain about the identification. If you cannot identify any food in the image at all, set "name" to "Unrecognized meal", "confidence" to "low", and all macros to 0.`
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin)
    }
    if (env.APP_SHARED_SECRET && request.headers.get('X-App-Secret') !== env.APP_SHARED_SECRET) {
      return json({ error: 'Unauthorized' }, 401, origin)
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Server not configured: missing ANTHROPIC_API_KEY' }, 500, origin)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid request body' }, 400, origin)
    }

    const dataUrl = body?.image
    if (typeof dataUrl !== 'string' || dataUrl.length > MAX_DATA_URL_LENGTH) {
      return json({ error: 'Expected a small base64 image data URL' }, 400, origin)
    }
    const match = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/)
    if (!match) {
      return json({ error: 'Malformed image data URL' }, 400, origin)
    }
    const [, mediaType, base64Data] = match

    let anthropicRes
    try {
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: env.MODEL_ID || DEFAULT_MODEL_ID,
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
                { type: 'text', text: buildPrompt() },
              ],
            },
          ],
        }),
      })
    } catch {
      return json({ error: 'Could not reach the vision model' }, 502, origin)
    }

    if (!anthropicRes.ok) {
      return json({ error: `Vision model request failed (${anthropicRes.status})` }, 502, origin)
    }

    const result = await anthropicRes.json()
    const text = result?.content?.find((c) => c.type === 'text')?.text || ''

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return json({ error: 'Could not parse the model response' }, 502, origin)
    }

    const clampNum = (n, max) => Math.max(0, Math.min(max, Math.round(Number(n) || 0)))
    return json(
      {
        matchedDishId: typeof parsed.matchedDishId === 'string' ? parsed.matchedDishId : null,
        name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : 'Unrecognized meal',
        confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'low',
        calories: clampNum(parsed.calories, 3000),
        protein: clampNum(parsed.protein, 300),
        carbs: clampNum(parsed.carbs, 400),
        fat: clampNum(parsed.fat, 250),
        fiber: clampNum(parsed.fiber, 100),
        notes: typeof parsed.notes === 'string' ? parsed.notes.slice(0, 200) : '',
      },
      200,
      origin
    )
  },
}
