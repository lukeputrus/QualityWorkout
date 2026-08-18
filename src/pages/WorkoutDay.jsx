import { useParams, useNavigate } from 'react-router-dom'
import { Radio } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import TopBar from '../components/TopBar.jsx'
import ExerciseRow from '../components/ExerciseRow.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getDay } from '../data/programs.js'
import { accent } from '../lib/theme.js'

export default function WorkoutDay() {
  const { dayId } = useParams()
  const navigate = useNavigate()
  const { profile } = useApp()
  const day = getDay(profile.gender, dayId)
  const a = accent(profile.gender)

  if (!day) {
    return (
      <PhoneShell>
        <TopBar title="Not found" back />
        <p className="text-ink-400 text-center mt-10">That workout day doesn't exist.</p>
      </PhoneShell>
    )
  }

  const totalMinutes = day.exercises.reduce((sum, ex) => {
    const work = ex.type === 'time' ? ex.seconds * ex.sets : ex.sets * 35
    const rest = ex.restSeconds * Math.max(0, ex.sets - 1)
    return sum + (work + rest) / 60
  }, 0)

  return (
    <PhoneShell>
      <TopBar title={day.title} back />
      <div className="px-5 pb-8">
        <div className={`rounded-3xl p-5 bg-gradient-to-br ${a.grad}`}>
          <span className="text-4xl">{day.emoji}</span>
          <p className="text-ink-950 font-extrabold text-2xl mt-2">{day.title}</p>
          <p className="text-ink-950/80 text-sm font-medium">{day.focus}</p>
          <p className="text-ink-950/70 text-xs font-semibold mt-2">
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

      <div className="sticky bottom-0 px-5 pb-6 pt-4 bg-gradient-to-t from-ink-900 via-ink-900 to-transparent">
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
