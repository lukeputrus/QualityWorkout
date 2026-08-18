// Rough estimates only — not medical-grade. Duration is modeled from each
// exercise's sets/reps/rest; calories use the standard MET formula
// (calories = MET x bodyweight-in-kg x hours), with a MET value assigned
// per workout day in data/programs.js.
const LB_TO_KG = 0.45359237

export function estimateDurationMinutes(day) {
  return day.exercises.reduce((sum, ex) => {
    const work = ex.type === 'time' ? ex.seconds * ex.sets : ex.sets * 35
    const rest = ex.restSeconds * Math.max(0, ex.sets - 1)
    return sum + (work + rest) / 60
  }, 0)
}

export function estimateCalories(day, profile) {
  if (!profile?.weight) return null
  const minutes = estimateDurationMinutes(day)
  const kg = profile.weightUnit === 'kg' ? profile.weight : profile.weight * LB_TO_KG
  const met = day.met || 5
  return Math.round(met * kg * (minutes / 60))
}
