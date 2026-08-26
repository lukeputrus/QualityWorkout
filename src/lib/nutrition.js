import { LB_TO_KG } from './estimate.js'
import { FIBER_BOOST_DISHES } from '../data/cuisines.js'

// Rough daily targets from bodyweight + goal — not personalized medical
// advice, same spirit as the calorie-burn estimate in lib/estimate.js.
// calPerKg / proteinPerKg are simplified per-goal multipliers rather than a
// full Mifflin-St Jeor calculation, since onboarding doesn't collect height.
const GOAL_FACTORS = {
  'lose-weight': { calPerKg: 28, proteinPerKg: 2.0 },
  'build-muscle': { calPerKg: 36, proteinPerKg: 2.0 },
  'tone-up': { calPerKg: 30, proteinPerKg: 1.8 },
  strength: { calPerKg: 34, proteinPerKg: 2.0 },
  general: { calPerKg: 31, proteinPerKg: 1.6 },
}
const FAT_SHARE = 0.28 // fraction of daily calories from fat; rest is carbs

export const OZ_TO_G = 28.3495

// Scales a per-100g nutrition object (a dish or an ingredient) to however
// many grams were actually eaten.
export function scalePer100g(item, grams) {
  const f = grams / 100
  return {
    calories: Math.round(item.calories * f),
    protein: Math.round(item.protein * f),
    carbs: Math.round(item.carbs * f),
    fat: Math.round(item.fat * f),
    fiber: Math.round(item.fiber * f),
  }
}

export function makeEntryId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function computeNutritionTargets(profile) {
  if (!profile?.weight) return null
  const kg = profile.weightUnit === 'kg' ? profile.weight : profile.weight * LB_TO_KG
  const factors = GOAL_FACTORS[profile.goal] || GOAL_FACTORS.general

  const calories = Math.round(kg * factors.calPerKg)
  const protein = Math.round(kg * factors.proteinPerKg)
  const fat = Math.round((calories * FAT_SHARE) / 9)
  const carbs = Math.round(Math.max(calories - protein * 4 - fat * 9, 0) / 4)
  const fiber = Math.round((calories / 1000) * 14)

  return { calories, protein, carbs, fat, fiber }
}

export function sumEntries(entries) {
  return (entries || []).reduce(
    (t, e) => ({
      calories: t.calories + e.calories,
      protein: t.protein + e.protein,
      carbs: t.carbs + e.carbs,
      fat: t.fat + e.fat,
      fiber: t.fiber + e.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  )
}

// Ties today's food log back to today's workout, per-goal targets, and what
// a typical plate is usually missing — the actual ask this feature was
// built for. Each insight is { id, text, quickAdds? } — quickAdds gives the
// UI a one-tap "just add this" action instead of only naming foods in text.
export function buildInsights({ totals, targets, todayWorkout, workoutCalories }) {
  if (!targets) return []
  if (totals.calories === 0) {
    return [{ id: 'empty', text: 'Log your first meal of the day to see how it stacks up against your plan.' }]
  }

  const insights = []
  const fiberPct = targets.fiber ? totals.fiber / targets.fiber : 1
  const proteinPct = targets.protein ? totals.protein / targets.protein : 1

  if (fiberPct < 0.8) {
    insights.push({
      id: 'fiber',
      text: "You're behind on fiber today — add a high-fiber meal to close the gap:",
      quickAdds: [
        { label: 'Iraqi meal', dishId: FIBER_BOOST_DISHES.iraqi },
        { label: 'American meal', dishId: FIBER_BOOST_DISHES.american },
      ],
    })
  }

  const isRestDay = todayWorkout && /rest/i.test(todayWorkout.id)
  if (!isRestDay && proteinPct < 0.6) {
    insights.push({
      id: 'protein',
      text: `Protein's behind for ${todayWorkout ? todayWorkout.title : "today's workout"} — kabab, masgouf, or chicken with rice will help recovery.`,
    })
  }

  if (workoutCalories && totals.calories < workoutCalories * 0.8) {
    insights.push({
      id: 'calories',
      text: `You've logged fewer calories than today's workout is estimated to burn (~${workoutCalories} kcal) — make sure your next meal covers the gap.`,
    })
  }

  if (insights.length === 0) {
    insights.push({ id: 'on-track', text: "You're on track today — nice balance across your meals so far." })
  }

  return insights.slice(0, 3)
}
