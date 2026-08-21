import { useNavigate } from 'react-router-dom'
import { ChevronRight, Flame, CheckCircle2 } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getProgram, GOALS } from '../data/programs.js'
import { accent } from '../lib/theme.js'

export default function Home() {
  const navigate = useNavigate()
  const { auth, profile, progress } = useApp()
  const a = accent(profile.gender)
  const program = getProgram(profile.gender)
  const goal = GOALS.find((g) => g.id === profile.goal)

  const todayIndex = new Date().getDay() % program.length
  const today = program[todayIndex]
  const todayDone = !!progress[today.id]

  const completedCount = Object.keys(progress).filter((id) => program.some((d) => d.id === id)).length

  return (
    <PhoneShell nav>
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-ink-600 text-sm">Welcome back,</p>
            <h1 className="font-serif text-xl font-semibold text-ink-950">{auth?.name?.split(' ')[0] || 'Athlete'}</h1>
          </div>
          <button
            onClick={() => navigate('/app/profile')}
            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white ${a.bg}`}
          >
            {(auth?.name || 'A')[0].toUpperCase()}
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${a.chip}`}>
            {goal?.label || 'General Fitness'}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-cream-300 text-ink-600">
            {profile.weight} {profile.weightUnit}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-cream-300 text-ink-600 flex items-center gap-1">
            <Flame size={12} /> {completedCount} done
          </span>
        </div>

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-7 mb-2">TODAY</p>
        <button
          onClick={() => navigate(`/app/day/${today.id}`)}
          className={`w-full text-left rounded-3xl p-5 bg-gradient-to-br ${a.grad} relative overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-4xl">{today.emoji}</span>
              {todayDone && (
                <span className="flex items-center gap-1 text-[11px] font-bold bg-white/25 text-white px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={12} /> Completed
                </span>
              )}
            </div>
            <p className="font-serif text-white font-semibold text-2xl mt-3">{today.title}</p>
            <p className="text-white/80 text-sm font-medium">{today.focus}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-white text-ink-950 text-sm font-bold px-4 py-2.5 rounded-xl">
              {todayDone ? 'Do It Again' : 'Start Workout'} <ChevronRight size={16} />
            </div>
          </div>
        </button>

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">THIS WEEK'S SPLIT</p>
        <div className="flex flex-col gap-2.5">
          {program.map((day) => {
            const done = !!progress[day.id]
            return (
              <button
                key={day.id}
                onClick={() => navigate(`/app/day/${day.id}`)}
                className="w-full flex items-center gap-3 bg-white hover:bg-cream-100 border border-cream-300 transition rounded-2xl p-3.5 text-left"
              >
                <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-cream-200">
                  {day.emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-ink-800">{day.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{day.focus} · {day.exercises.length} exercises</p>
                </span>
                {done ? (
                  <CheckCircle2 size={20} className={a.text} />
                ) : (
                  <ChevronRight size={18} className="text-ink-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </PhoneShell>
  )
}
