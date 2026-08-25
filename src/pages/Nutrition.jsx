import { useNavigate } from 'react-router-dom'
import { Camera, Lightbulb, Trash2 } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getTodayDay } from '../data/programs.js'
import { findDish } from '../data/nutritionDishes.js'
import { accent } from '../lib/theme.js'
import { estimateCalories } from '../lib/estimate.js'
import { todayKey, computeNutritionTargets, sumEntries, buildInsights, makeEntryId } from '../lib/nutrition.js'

function MacroStat({ label, value, target, unit, accentHex }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0
  return (
    <div className="bg-white border border-cream-300 rounded-2xl p-3">
      <p className="text-ink-400 text-[11px] font-bold tracking-wide">{label.toUpperCase()}</p>
      <p className="text-ink-950 font-extrabold text-lg mt-0.5">
        {value}
        <span className="text-ink-400 font-semibold text-xs">
          {' '}
          / {target}
          {unit}
        </span>
      </p>
      <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden mt-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: accentHex }} />
      </div>
    </div>
  )
}

export default function Nutrition() {
  const navigate = useNavigate()
  const { profile, foodLog, logMeal, deleteMeal } = useApp()
  const a = accent(profile?.gender)
  const today = getTodayDay(profile?.gender)
  const dateKey = todayKey()
  const entries = foodLog[dateKey] || []

  const targets = computeNutritionTargets(profile)
  const totals = sumEntries(entries)
  const workoutCalories = today ? estimateCalories(today, profile) : null
  const insights = buildInsights({ totals, targets, todayWorkout: today, workoutCalories })

  function quickAdd(dishId) {
    const dish = findDish(dishId)
    if (!dish) return
    logMeal(dateKey, {
      id: makeEntryId(),
      dishId: dish.id,
      name: dish.name,
      emoji: dish.emoji,
      servingMultiplier: 1,
      calories: dish.calories,
      protein: dish.protein,
      carbs: dish.carbs,
      fat: dish.fat,
      fiber: dish.fiber,
      photo: null,
      loggedAt: new Date().toISOString(),
    })
  }

  return (
    <PhoneShell nav>
      <div className="px-5 pb-8">
        <div className="pt-1">
          <h1 className="font-serif text-xl font-semibold text-ink-950">Today's Fuel</h1>
          <p className="text-ink-600 text-sm mt-0.5">
            {today ? `Fueling ${today.title.toLowerCase()}` : 'Track what you eat today'}
          </p>
        </div>

        {targets && (
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <MacroStat label="Calories" value={totals.calories} target={targets.calories} unit="" accentHex={a.bgHex} />
            <MacroStat label="Protein" value={totals.protein} target={targets.protein} unit="g" accentHex={a.bgHex} />
            <MacroStat label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" accentHex={a.bgHex} />
            <MacroStat label="Fat" value={totals.fat} target={targets.fat} unit="g" accentHex={a.bgHex} />
          </div>
        )}

        {targets && (
          <div className="mt-2.5">
            <MacroStat label="Fiber" value={totals.fiber} target={targets.fiber} unit="g" accentHex={a.bgHex} />
          </div>
        )}

        <div className="flex flex-col gap-2.5 mt-5">
          {insights.map((tip) => (
            <div key={tip.id} className={`rounded-2xl p-3.5 border ${a.chip}`}>
              <div className="flex items-start gap-2.5">
                <Lightbulb size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm leading-snug">{tip.text}</p>
              </div>
              {tip.quickAdds && (
                <div className="flex gap-2 mt-3 pl-[26px]">
                  {tip.quickAdds.map((qa) => (
                    <button
                      key={qa.dishId}
                      onClick={() => quickAdd(qa.dishId)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${a.bg} text-white`}
                    >
                      + {qa.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">LOGGED TODAY</p>
        {entries.length === 0 ? (
          <div className="bg-white border border-cream-300 rounded-2xl p-6 text-center">
            <p className="text-ink-600 text-sm">No meals logged yet.</p>
            <p className="text-ink-400 text-xs mt-1">Snap a photo of your plate to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-3 bg-white border border-cream-300 rounded-2xl p-3">
                {e.photo ? (
                  <img src={e.photo} alt={e.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <span className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center text-2xl shrink-0">
                    {e.emoji}
                  </span>
                )}
                <span className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-ink-800 truncate">{e.name}</p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {e.calories} kcal · {e.protein}g protein
                    {e.servingMultiplier !== 1 ? ` · ${e.servingMultiplier}x serving` : ''}
                  </p>
                </span>
                <button
                  onClick={() => deleteMeal(dateKey, e.id)}
                  aria-label="Remove meal"
                  className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-ink-400 hover:bg-cream-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 px-5 pb-6 pt-4 bg-gradient-to-t from-cream-50 via-cream-50 to-transparent">
        <Button className="w-full" accentClass={a.solidBtn} onClick={() => navigate('/app/nutrition/log')}>
          <Camera size={16} /> Log a Meal
        </Button>
      </div>
    </PhoneShell>
  )
}
