import { Play } from 'lucide-react'

export default function ExerciseRow({ exercise, index, onClick, accentChip }) {
  const detail =
    exercise.type === 'time'
      ? `${exercise.sets} x ${exercise.seconds >= 60 ? Math.round(exercise.seconds / 60) + ' min' : exercise.seconds + ' sec'}`
      : `${exercise.sets} x ${exercise.reps} reps`

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white hover:bg-cream-100 border border-cream-300 transition rounded-2xl p-3 text-left"
    >
      <span className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold ${accentChip}`}>
        {index + 1}
      </span>
      <span className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink-800 truncate">{exercise.name}</p>
        <p className="text-xs text-ink-400 mt-0.5">{detail}</p>
      </span>
      <span className="w-9 h-9 shrink-0 rounded-full bg-cream-200 flex items-center justify-center text-ink-800">
        <Play size={14} fill="currentColor" className="ml-0.5" />
      </span>
    </button>
  )
}
