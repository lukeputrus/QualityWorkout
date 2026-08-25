import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, Search, Check, X } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import TopBar from '../components/TopBar.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { accent } from '../lib/theme.js'
import { IRAQI_DISHES, OTHER_DISHES } from '../data/nutritionDishes.js'
import { todayKey, resizeImageToDataUrl, makeEntryId } from '../lib/nutrition.js'

const SERVINGS = [0.5, 1, 1.5, 2]

function scale(dish, mult) {
  return {
    calories: Math.round(dish.calories * mult),
    protein: Math.round(dish.protein * mult),
    carbs: Math.round(dish.carbs * mult),
    fat: Math.round(dish.fat * mult),
    fiber: Math.round(dish.fiber * mult),
  }
}

export default function LogMeal() {
  const navigate = useNavigate()
  const { profile, logMeal } = useApp()
  const a = accent(profile?.gender)

  const [phase, setPhase] = useState('capture') // capture | preparing | confirm
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedDish, setSelectedDish] = useState(null)
  const [servingMultiplier, setServingMultiplier] = useState(1)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCalories, setCustomCalories] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')
  const [customFiber, setCustomFiber] = useState('')

  const cameraInputRef = useRef(null)
  const libraryInputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    setError('')
    setPhase('preparing')
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setPhoto(dataUrl)
    } catch {
      setError("Couldn't load that photo, but you can still search and log the meal below.")
    }
    setPhase('confirm')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (d) => !q || d.name.toLowerCase().includes(q)
    return { iraqi: IRAQI_DISHES.filter(match), other: OTHER_DISHES.filter(match) }
  }, [query])

  const preview = selectedDish ? scale(selectedDish, servingMultiplier) : null
  const customValid = customName.trim() && Number(customCalories) > 0
  const canSubmit = (selectedDish && preview) || (customMode && customValid)

  function handleSubmit() {
    const entry = selectedDish
      ? {
          id: makeEntryId(),
          dishId: selectedDish.id,
          name: selectedDish.name,
          emoji: selectedDish.emoji,
          servingMultiplier,
          ...preview,
          photo,
          loggedAt: new Date().toISOString(),
        }
      : {
          id: makeEntryId(),
          dishId: 'custom',
          name: customName.trim(),
          emoji: '🍽️',
          servingMultiplier: 1,
          calories: Math.round(Number(customCalories) || 0),
          protein: Math.round(Number(customProtein) || 0),
          carbs: Math.round(Number(customCarbs) || 0),
          fat: Math.round(Number(customFat) || 0),
          fiber: Math.round(Number(customFiber) || 0),
          photo,
          loggedAt: new Date().toISOString(),
        }

    logMeal(todayKey(), entry)
    navigate('/app/nutrition')
  }

  function pickDish(d) {
    setSelectedDish(d)
    setCustomMode(false)
    setServingMultiplier(1)
  }

  return (
    <PhoneShell>
      <TopBar title="Log a Meal" back />

      {phase === 'capture' && (
        <div className="px-5 pb-8 flex flex-col min-h-full">
          <div className="mt-4 rounded-3xl border-2 border-dashed border-cream-300 bg-cream-100 p-8 flex flex-col items-center text-center">
            <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 ${a.bg}`}>
              <Camera size={26} />
            </span>
            <h1 className="font-serif text-xl font-semibold text-ink-950">Take a photo of your plate</h1>
            <p className="text-ink-600 text-sm mt-2 max-w-[260px]">
              We'll save it with today's log and help you match it to nutrition facts.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button className="w-full" accentClass={a.solidBtn} onClick={() => cameraInputRef.current?.click()}>
              <Camera size={16} /> Take Photo
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => libraryInputRef.current?.click()}>
              <ImageIcon size={16} /> Choose from Library
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={libraryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <button
            onClick={() => setPhase('confirm')}
            className="mt-auto pt-8 text-center text-sm font-semibold text-ink-600 underline underline-offset-2"
          >
            Skip the photo, just search
          </button>
        </div>
      )}

      {phase === 'preparing' && (
        <div className="px-5 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className={`w-10 h-10 rounded-full border-2 border-cream-300 animate-spin mb-4`} style={{ borderTopColor: a.bgHex }} />
          <p className="text-ink-600 text-sm">Preparing your photo…</p>
        </div>
      )}

      {phase === 'confirm' && (
        <div className="px-5 pb-8 flex flex-col min-h-full">
          {photo && (
            <div className="relative mt-1 rounded-2xl overflow-hidden aspect-video bg-cream-200">
              <img src={photo} alt="Your plate" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  setPhoto(null)
                  setPhase('capture')
                }}
                aria-label="Remove photo"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {error && <p className="text-terracotta-600 text-xs mt-2">{error}</p>}

          <p className="text-ink-600 text-xs mt-4">
            Search and confirm what's on your plate — auto-detecting the dish from the photo isn't available yet, so
            this keeps the numbers accurate.
          </p>

          <div className="relative mt-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes (e.g. bamya, kabab, rice)"
              className="w-full bg-cream-100 border border-cream-300 rounded-2xl pl-10 pr-4 py-3 text-sm text-ink-950 placeholder-ink-400 outline-none focus:border-terracotta-500"
            />
          </div>

          <div className="mt-3 max-h-[300px] overflow-y-auto no-scrollbar flex flex-col gap-4">
            {filtered.iraqi.length > 0 && (
              <div>
                <p className="text-ink-400 text-[11px] font-bold tracking-wide mb-1.5">IRAQI FAVORITES</p>
                <div className="flex flex-col gap-1.5">
                  {filtered.iraqi.map((d) => (
                    <DishRow key={d.id} dish={d} selected={selectedDish?.id === d.id} onClick={() => pickDish(d)} accentChip={a.chip} />
                  ))}
                </div>
              </div>
            )}
            {filtered.other.length > 0 && (
              <div>
                <p className="text-ink-400 text-[11px] font-bold tracking-wide mb-1.5">OTHER</p>
                <div className="flex flex-col gap-1.5">
                  {filtered.other.map((d) => (
                    <DishRow key={d.id} dish={d} selected={selectedDish?.id === d.id} onClick={() => pickDish(d)} accentChip={a.chip} />
                  ))}
                </div>
              </div>
            )}
            {filtered.iraqi.length === 0 && filtered.other.length === 0 && (
              <p className="text-ink-400 text-sm text-center py-4">No matches — try adding it manually below.</p>
            )}
          </div>

          {selectedDish && preview && (
            <div className={`mt-4 rounded-2xl border p-4 ${a.chip}`}>
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">{selectedDish.name}</p>
                <Check size={16} />
              </div>
              <div className="flex gap-1.5 mt-3">
                {SERVINGS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setServingMultiplier(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      servingMultiplier === s ? `${a.bg} text-white` : 'bg-white/60 text-ink-700'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3 opacity-90">
                {preview.calories} kcal · {preview.protein}g protein · {preview.carbs}g carbs · {preview.fat}g fat ·{' '}
                {preview.fiber}g fiber
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setCustomMode((v) => !v)
              setSelectedDish(null)
            }}
            className="mt-4 text-sm font-semibold text-ink-600 underline underline-offset-2 self-start"
          >
            {customMode ? 'Hide manual entry' : "Can't find it? Add manually"}
          </button>

          {customMode && (
            <div className="mt-3 flex flex-col gap-2.5">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Dish name"
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
          )}

          <div className="mt-auto pt-6">
            <Button className="w-full" accentClass={a.solidBtn} disabled={!canSubmit} onClick={handleSubmit}>
              Log This Meal
            </Button>
          </div>
        </div>
      )}
    </PhoneShell>
  )
}

function DishRow({ dish, selected, onClick, accentChip }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-2xl p-2.5 text-left border transition ${
        selected ? accentChip : 'bg-white border-cream-300'
      }`}
    >
      <span className="text-xl w-9 h-9 shrink-0 rounded-xl bg-cream-100 flex items-center justify-center">{dish.emoji}</span>
      <span className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-800 truncate">{dish.name}</p>
        <p className="text-xs text-ink-400">{dish.serving} · {dish.calories} kcal</p>
      </span>
      {selected && <Check size={16} className="shrink-0" />}
    </button>
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
