import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, Globe, Search, Check, X, ChevronRight, Pencil } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import TopBar from '../components/TopBar.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { accent } from '../lib/theme.js'
import { INGREDIENTS, INGREDIENT_CATEGORIES, findIngredient } from '../data/ingredients.js'
import { CUISINES, CUISINE_DISHES } from '../data/cuisines.js'
import { todayKey, makeEntryId, scalePer100g, OZ_TO_G } from '../lib/nutrition.js'

const ZERO_TOTALS = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }

function gramsFrom(amount, unit) {
  const n = Number(amount)
  if (!n || n < 0) return 0
  return unit === 'oz' ? n * OZ_TO_G : n
}

// Converts the displayed number when the unit toggle changes, so "300"
// still means the same real-world quantity after switching g<->oz instead
// of being silently reinterpreted (300g becoming "300oz" would be ~8.5kg).
function convertAmount(amount, fromUnit, toUnit) {
  if (fromUnit === toUnit) return amount
  const grams = gramsFrom(amount, fromUnit)
  const converted = toUnit === 'oz' ? grams / OZ_TO_G : grams
  return Math.round(converted * 10) / 10
}

function addTotals(a, b) {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    fiber: a.fiber + b.fiber,
  }
}

export default function LogMeal() {
  const navigate = useNavigate()
  const { profile, logMeal } = useApp()
  const a = accent(profile?.gender)

  // choose | ingredients | cuisine-select | cuisine-dish | custom
  const [phase, setPhase] = useState('choose')

  // --- ingredient-builder state ---
  const [ingredientQuery, setIngredientQuery] = useState('')
  const [addedIngredients, setAddedIngredients] = useState([]) // { id, ingredientId, amount, unit }

  // --- cuisine-picker state ---
  const [selectedCuisine, setSelectedCuisine] = useState(null)
  const [dishQuery, setDishQuery] = useState('')
  const [selectedDish, setSelectedDish] = useState(null)
  const [dishAmount, setDishAmount] = useState(100)
  const [dishUnit, setDishUnit] = useState('g')

  // --- manual/custom state ---
  const [customName, setCustomName] = useState('')
  const [customCalories, setCustomCalories] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')
  const [customFiber, setCustomFiber] = useState('')

  function logEntry(entry) {
    logMeal(todayKey(), { id: makeEntryId(), servingMultiplier: 1, photo: null, loggedAt: new Date().toISOString(), ...entry })
    navigate('/app/nutrition')
  }

  // ---------- ingredients ----------
  const filteredIngredients = useMemo(() => {
    const q = ingredientQuery.trim().toLowerCase()
    const list = q ? INGREDIENTS.filter((i) => i.name.toLowerCase().includes(q)) : INGREDIENTS
    return INGREDIENT_CATEGORIES.map((cat) => ({ category: cat, items: list.filter((i) => i.category === cat) })).filter(
      (g) => g.items.length > 0
    )
  }, [ingredientQuery])

  function addIngredient(ingredientId) {
    setAddedIngredients((list) => [...list, { id: makeEntryId(), ingredientId, amount: 100, unit: 'g' }])
  }
  function updateIngredientRow(id, patch) {
    setAddedIngredients((list) => list.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }
  function removeIngredientRow(id) {
    setAddedIngredients((list) => list.filter((row) => row.id !== id))
  }

  const ingredientTotals = addedIngredients.reduce((totals, row) => {
    const ing = findIngredient(row.ingredientId)
    if (!ing) return totals
    return addTotals(totals, scalePer100g(ing, gramsFrom(row.amount, row.unit)))
  }, ZERO_TOTALS)

  function handleSubmitIngredients() {
    const names = addedIngredients.map((row) => findIngredient(row.ingredientId)?.name).filter(Boolean)
    const name = names.length <= 2 ? names.join(' + ') : `${names.slice(0, 2).join(' + ')} + ${names.length - 2} more`
    logEntry({ dishId: 'ingredients', name: name || 'Custom meal', emoji: '🍽️', ...ingredientTotals })
  }

  // ---------- cuisine picker ----------
  const cuisineDishes = selectedCuisine ? CUISINE_DISHES[selectedCuisine] || [] : []
  const filteredDishes = useMemo(() => {
    const q = dishQuery.trim().toLowerCase()
    return q ? cuisineDishes.filter((d) => d.name.toLowerCase().includes(q)) : cuisineDishes
  }, [cuisineDishes, dishQuery])

  function pickDish(d) {
    setSelectedDish(d)
    setDishAmount(d.typicalGrams)
    setDishUnit('g')
  }
  const dishPreview = selectedDish ? scalePer100g(selectedDish, gramsFrom(dishAmount, dishUnit)) : null

  function handleSubmitDish() {
    logEntry({ dishId: selectedDish.id, name: selectedDish.name, emoji: selectedDish.emoji, ...dishPreview })
  }

  // ---------- custom ----------
  const customValid = customName.trim() && Number(customCalories) > 0
  function handleSubmitCustom() {
    logEntry({
      dishId: 'custom',
      name: customName.trim(),
      emoji: '🍽️',
      calories: Math.round(Number(customCalories) || 0),
      protein: Math.round(Number(customProtein) || 0),
      carbs: Math.round(Number(customCarbs) || 0),
      fat: Math.round(Number(customFat) || 0),
      fiber: Math.round(Number(customFiber) || 0),
    })
  }

  const titles = {
    choose: 'Log a Meal',
    ingredients: 'Add Ingredients',
    'cuisine-select': 'Choose a Region',
    'cuisine-dish': CUISINES.find((c) => c.id === selectedCuisine)?.label || 'Choose a Meal',
    custom: 'Manual Entry',
  }
  const backHandlers = {
    ingredients: () => setPhase('choose'),
    'cuisine-select': () => setPhase('choose'),
    'cuisine-dish': () => {
      setSelectedDish(null)
      setPhase('cuisine-select')
    },
    custom: () => setPhase('choose'),
  }

  return (
    <PhoneShell>
      <TopBar title={titles[phase]} back={phase !== 'choose'} onBack={backHandlers[phase]} />

      {phase === 'choose' && (
        <div className="px-5 pb-8 flex flex-col min-h-full">
          <p className="text-ink-600 text-sm mt-1 mb-5">How do you want to log this meal?</p>

          <button
            onClick={() => setPhase('ingredients')}
            className="w-full text-left rounded-3xl border border-cream-300 bg-white hover:bg-cream-100 transition p-5 flex items-start gap-4"
          >
            <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 ${a.bg}`}>
              <Scale size={20} />
            </span>
            <span className="flex-1">
              <p className="font-serif font-semibold text-ink-950">Build from ingredients</p>
              <p className="text-ink-600 text-sm mt-1">Add each ingredient with exact grams or ounces.</p>
            </span>
            <ChevronRight size={18} className="text-ink-400 shrink-0 mt-1" />
          </button>

          <button
            onClick={() => setPhase('cuisine-select')}
            className="w-full text-left rounded-3xl border border-cream-300 bg-white hover:bg-cream-100 transition p-5 flex items-start gap-4 mt-3"
          >
            <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 ${a.bg}`}>
              <Globe size={20} />
            </span>
            <span className="flex-1">
              <p className="font-serif font-semibold text-ink-950">Pick a meal by cuisine</p>
              <p className="text-ink-600 text-sm mt-1">Choose a region, then a common dish and amount.</p>
            </span>
            <ChevronRight size={18} className="text-ink-400 shrink-0 mt-1" />
          </button>

          <button
            onClick={() => setPhase('custom')}
            className="mt-auto pt-8 flex items-center justify-center gap-2 text-sm font-semibold text-ink-600 underline underline-offset-2"
          >
            <Pencil size={13} /> Or enter nutrition facts manually
          </button>
        </div>
      )}

      {phase === 'ingredients' && (
        <div className="px-5 pb-8 flex flex-col min-h-full">
          <div className="relative mt-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={ingredientQuery}
              onChange={(e) => setIngredientQuery(e.target.value)}
              placeholder="Search ingredients (e.g. chicken, rice, olive oil)"
              className="w-full bg-cream-100 border border-cream-300 rounded-2xl pl-10 pr-4 py-3 text-sm text-ink-950 placeholder-ink-400 outline-none focus:border-terracotta-500"
            />
          </div>

          <div className="mt-3 max-h-[220px] overflow-y-auto no-scrollbar flex flex-col gap-4">
            {filteredIngredients.map((group) => (
              <div key={group.category}>
                <p className="text-ink-400 text-[11px] font-bold tracking-wide mb-1.5">{group.category.toUpperCase()}</p>
                <div className="flex flex-col gap-1.5">
                  {group.items.map((ing) => (
                    <button
                      key={ing.id}
                      onClick={() => addIngredient(ing.id)}
                      className="w-full flex items-center gap-3 rounded-2xl p-2.5 text-left border bg-white border-cream-300 hover:bg-cream-100 transition"
                    >
                      <span className="text-xl w-9 h-9 shrink-0 rounded-xl bg-cream-100 flex items-center justify-center">{ing.emoji}</span>
                      <span className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">{ing.name}</p>
                        <p className="text-xs text-ink-400">{ing.calories} kcal / 100g</p>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredIngredients.length === 0 && <p className="text-ink-400 text-sm text-center py-4">No matches.</p>}
          </div>

          {addedIngredients.length > 0 && (
            <>
              <p className="text-ink-400 text-xs font-bold tracking-wide mt-5 mb-2">
                ADDED ({addedIngredients.length})
              </p>
              <div className="flex flex-col gap-2">
                {addedIngredients.map((row) => {
                  const ing = findIngredient(row.ingredientId)
                  if (!ing) return null
                  const rowMacros = scalePer100g(ing, gramsFrom(row.amount, row.unit))
                  return (
                    <div key={row.id} className="flex items-center gap-2.5 bg-white border border-cream-300 rounded-2xl p-2.5">
                      <span className="text-lg w-8 h-8 shrink-0 rounded-lg bg-cream-100 flex items-center justify-center">{ing.emoji}</span>
                      <span className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">{ing.name}</p>
                        <p className="text-xs text-ink-400">{rowMacros.calories} kcal</p>
                      </span>
                      <input
                        type="number"
                        min="0"
                        inputMode="decimal"
                        value={row.amount}
                        onChange={(e) => updateIngredientRow(row.id, { amount: e.target.value })}
                        className="w-16 bg-cream-100 border border-cream-300 rounded-xl px-2 py-1.5 text-sm text-ink-950 outline-none focus:border-terracotta-500"
                      />
                      <div className="flex gap-1 shrink-0">
                        {['g', 'oz'].map((u) => (
                          <button
                            key={u}
                            onClick={() => updateIngredientRow(row.id, { amount: convertAmount(row.amount, row.unit, u), unit: u })}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${
                              row.unit === u ? `${a.bg} text-white` : 'bg-cream-200 text-ink-600'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => removeIngredientRow(row.id)}
                        aria-label="Remove ingredient"
                        className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-ink-400 hover:bg-cream-100"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className={`mt-3 rounded-2xl border p-3.5 ${a.chip}`}>
                <p className="text-xs font-bold tracking-wide">MEAL TOTAL</p>
                <p className="text-sm mt-1">
                  {ingredientTotals.calories} kcal · {ingredientTotals.protein}g protein · {ingredientTotals.carbs}g carbs ·{' '}
                  {ingredientTotals.fat}g fat · {ingredientTotals.fiber}g fiber
                </p>
              </div>
            </>
          )}

          <div className="mt-auto pt-6">
            <Button className="w-full" accentClass={a.solidBtn} disabled={addedIngredients.length === 0} onClick={handleSubmitIngredients}>
              Log This Meal
            </Button>
          </div>
        </div>
      )}

      {phase === 'cuisine-select' && (
        <div className="px-5 pb-8">
          <p className="text-ink-600 text-sm mt-1 mb-4">Pick the region this meal is from.</p>
          <div className="grid grid-cols-2 gap-3">
            {CUISINES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCuisine(c.id)
                  setDishQuery('')
                  setSelectedDish(null)
                  setPhase('cuisine-dish')
                }}
                className="rounded-2xl border border-cream-300 bg-white hover:bg-cream-100 transition p-4 flex flex-col items-center gap-2"
              >
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-sm font-semibold text-ink-800">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'cuisine-dish' && (
        <div className="px-5 pb-8 flex flex-col min-h-full">
          <div className="relative mt-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={dishQuery}
              onChange={(e) => setDishQuery(e.target.value)}
              placeholder="Search dishes"
              className="w-full bg-cream-100 border border-cream-300 rounded-2xl pl-10 pr-4 py-3 text-sm text-ink-950 placeholder-ink-400 outline-none focus:border-terracotta-500"
            />
          </div>

          <div className="mt-3 max-h-[280px] overflow-y-auto no-scrollbar flex flex-col gap-1.5">
            {filteredDishes.map((d) => (
              <button
                key={d.id}
                onClick={() => pickDish(d)}
                className={`w-full flex items-center gap-3 rounded-2xl p-2.5 text-left border transition ${
                  selectedDish?.id === d.id ? a.chip : 'bg-white border-cream-300 hover:bg-cream-100'
                }`}
              >
                <span className="text-xl w-9 h-9 shrink-0 rounded-xl bg-cream-100 flex items-center justify-center">{d.emoji}</span>
                <span className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-800 truncate">{d.name}</p>
                  <p className="text-xs text-ink-400">{d.calories} kcal / 100g</p>
                </span>
                {selectedDish?.id === d.id && <Check size={16} className="shrink-0" />}
              </button>
            ))}
            {filteredDishes.length === 0 && <p className="text-ink-400 text-sm text-center py-4">No matches.</p>}
          </div>

          {selectedDish && dishPreview && (
            <div className={`mt-4 rounded-2xl border p-4 ${a.chip}`}>
              <p className="font-bold text-sm">{selectedDish.name}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-semibold">Amount:</span>
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={dishAmount}
                  onChange={(e) => setDishAmount(e.target.value)}
                  className="w-20 bg-white/70 border border-current/20 rounded-xl px-2.5 py-1.5 text-sm outline-none"
                />
                <div className="flex gap-1">
                  {['g', 'oz'].map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setDishAmount((prev) => convertAmount(prev, dishUnit, u))
                        setDishUnit(u)
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                        dishUnit === u ? `${a.bg} text-white` : 'bg-white/60 text-ink-700'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs mt-3 opacity-90">
                {dishPreview.calories} kcal · {dishPreview.protein}g protein · {dishPreview.carbs}g carbs · {dishPreview.fat}g fat ·{' '}
                {dishPreview.fiber}g fiber
              </p>
            </div>
          )}

          <div className="mt-auto pt-6">
            <Button className="w-full" accentClass={a.solidBtn} disabled={!selectedDish} onClick={handleSubmitDish}>
              Log This Meal
            </Button>
          </div>
        </div>
      )}

      {phase === 'custom' && (
        <div className="px-5 pb-8 flex flex-col min-h-full">
          <p className="text-ink-600 text-sm mt-1 mb-4">
            Type in the nutrition facts yourself — useful for packaged food with a label, or anything not covered above.
          </p>
          <div className="flex flex-col gap-2.5">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Meal name"
              className="w-full bg-cream-100 border border-cream-300 rounded-2xl px-4 py-3 text-sm text-ink-950 placeholder-ink-400 outline-none focus:border-terracotta-500"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <NumberField label="Calories" value={customCalories} onChange={setCustomCalories} required />
              <NumberField label="Protein (g)" value={customProtein} onChange={setCustomProtein} />
              <NumberField label="Carbs (g)" value={customCarbs} onChange={setCustomCarbs} />
              <NumberField label="Fat (g)" value={customFat} onChange={setCustomFat} />
            </div>
            <NumberField label="Fiber (g)" value={customFiber} onChange={setCustomFiber} />
          </div>

          <div className="mt-auto pt-6">
            <Button className="w-full" accentClass={a.solidBtn} disabled={!customValid} onClick={handleSubmitCustom}>
              Log This Meal
            </Button>
          </div>
        </div>
      )}
    </PhoneShell>
  )
}

function NumberField({ label, value, onChange, required = false }) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink-600">
        {label}
        {required ? '' : ' (optional)'}
      </label>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="mt-1 w-full bg-cream-100 border border-cream-300 rounded-2xl px-3.5 py-2.5 text-sm text-ink-950 placeholder-ink-400 outline-none focus:border-terracotta-500"
      />
    </div>
  )
}
