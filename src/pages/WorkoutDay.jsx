import { useParams, useNavigate } from 'react-router-dom'
import { Radio } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import TopBar from '../components/TopBar.jsx'
import ExerciseRow from '../components/ExerciseRow.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getDay } from '../data/programs.js'
import { accent } from '../lib/theme.js'
import { estimateDurationMinutes } from '../lib/estimate.js'

export default function WorkoutDay() {
  const { dayId } = useParams()
  const navigate = useNavigate()
  const { profile } = useApp()
  const day = getDay(profile.gender, dayId)
  const a = accent(profile.gender)

  if (!day) {
    return (
      <PhoneShell nav>
        <TopBar title="Not found" back />
        <p className="text-ink-600 text-center mt-10">That workout day doesn't exist.</p>
      </PhoneShell>
    )
  }

  const totalMinutes = estimateDurationMinutes(day)

  return (
    <PhoneShell nav>
      <TopBar title={day.title} back />
      <div className="px-5 pb-8">
        <div className={`rounded-3xl p-5 bg-gradient-to-br ${a.grad}`}>
          <span className="text-4xl">{day.emoji}</span>
          <p className="font-serif text-white font-semibold text-2xl mt-2">{day.title}</p>
          <p className="text-white/80 text-sm font-medium">{day.focus}</p>
          <p className="text-white/70 text-xs font-semibold mt-2">
            {day.exercises.length} exercises · ~{Math.round(totalMinutes)} min
          </p>
        </div>

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-7 mb-2">EXERCISES</p>
        <div className="flex flex-col gap-2.5">
          {day.exercises.map((ex, i) => (
            <ExerciseRow
              key={ex.name}
              exercise={ex}
              index={i}
              accentChip={a.chip}
              onClick={() => navigate(`/app/play/${day.id}?ex=${i}`)}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 px-5 pb-6 pt-4 bg-gradient-to-t from-cream-50 via-cream-50 to-transparent">
        <Button
          className="w-full"
          accentClass={a.solidBtn}
          onClick={() => navigate(`/app/play/${day.id}?ex=0`)}
        >
          <Radio size={16} /> Start Live Follow-Along
        </Button>
      </div>
    </PhoneShell>
  )
}
