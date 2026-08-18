import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { X, PartyPopper, Home as HomeIcon, Flame, Clock } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getDay } from '../data/programs.js'
import { accent } from '../lib/theme.js'
import { estimateDurationMinutes, estimateCalories } from '../lib/estimate.js'
import { EXERCISE_VIDEOS } from '../data/exerciseVideos.js'

function formatTime(s) {
  const m = Math.floor(Math.max(s, 0) / 60)
  const sec = Math.max(s, 0) % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Player() {
  const { dayId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { profile, completeDay } = useApp()
  const day = getDay(profile.gender, dayId)
  const a = accent(profile.gender)

  const clampedStart = day
    ? Math.min(Math.max(parseInt(searchParams.get('ex') || '0', 10) || 0, 0), day.exercises.length - 1)
    : 0
  const startExercise = day?.exercises[clampedStart]

  const [exIndex, setExIndex] = useState(clampedStart)
  const [setNum, setSetNum] = useState(1)
  const [phase, setPhase] = useState('work') // work | rest | complete
  const [timeLeft, setTimeLeft] = useState(() => (startExercise?.type === 'time' ? startExercise.seconds : 0))

  const exercise = day?.exercises[exIndex]
  const isLastSet = exercise ? setNum >= exercise.sets : true
  const isLastExercise = day ? exIndex >= day.exercises.length - 1 : true

  // Phase and timeLeft are always set together (see startWork/startRest below)
  // so the ticking effect below never reads a stale timeLeft from the render
  // where the phase just changed. There's no pause control here — the
  // exercise video is now a real embedded YouTube player with its own
  // independent controls we can't observe, so the set/rest timer just runs.
  useEffect(() => {
    if (phase === 'complete' || !exercise) return
    const isTicking = phase === 'rest' || (phase === 'work' && exercise.type === 'time')
    if (!isTicking) return
    if (timeLeft <= 0) {
      handleAdvance()
      return
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase])

  if (!day || !exercise) {
    return (
      <PhoneShell>
        <div className="px-5 pt-4">
          <button onClick={() => navigate('/app/home')} className="text-ink-300">
            <X size={22} />
          </button>
          <p className="text-ink-400 text-center mt-10">Workout not found.</p>
        </div>
      </PhoneShell>
    )
  }

  function startWork(nextExercise) {
    setPhase('work')
    setTimeLeft(nextExercise.type === 'time' ? nextExercise.seconds : 0)
  }

  function startRest(currentExercise) {
    setPhase('rest')
    setTimeLeft(currentExercise.restSeconds)
  }

  function handleAdvance() {
    if (phase === 'work') {
      if (!isLastSet && exercise.restSeconds > 0) {
        startRest(exercise)
      } else {
        goNextSetOrExercise()
      }
    } else if (phase === 'rest') {
      goNextSetOrExercise()
    }
  }

  function goNextSetOrExercise() {
    if (!isLastSet) {
      setSetNum((n) => n + 1)
      startWork(exercise)
    } else if (!isLastExercise) {
      const next = day.exercises[exIndex + 1]
      setExIndex((i) => i + 1)
      setSetNum(1)
      startWork(next)
    } else {
      completeDay(day.id)
      setPhase('complete')
    }
  }

  if (phase === 'complete') {
    const minutes = Math.round(estimateDurationMinutes(day))
    const calories = estimateCalories(day, profile)

    return (
      <PhoneShell>
        <div className="px-6 pt-4 flex flex-col min-h-full">
          <button onClick={() => navigate(`/app/day/${day.id}`)} className="text-ink-300 self-start">
            <X size={22} />
          </button>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${a.grad} flex items-center justify-center mb-6`}>
              <PartyPopper size={36} className="text-ink-950" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Workout Complete!</h1>
            <p className="text-ink-400 text-sm mt-2 max-w-[260px]">
              You just finished {day.title.toLowerCase()} — {day.exercises.length} exercises done.
            </p>

            <div className="flex gap-3 mt-6 w-full max-w-[280px]">
              <div className="flex-1 bg-ink-850 rounded-2xl p-4">
                <Flame size={18} className={`${a.text} mx-auto`} />
                <p className="text-white font-extrabold text-xl mt-1">{calories ?? '—'}</p>
                <p className="text-ink-400 text-[11px]">calories (est.)</p>
              </div>
              <div className="flex-1 bg-ink-850 rounded-2xl p-4">
                <Clock size={18} className={`${a.text} mx-auto`} />
                <p className="text-white font-extrabold text-xl mt-1">{minutes}</p>
                <p className="text-ink-400 text-[11px]">minutes</p>
              </div>
            </div>
            <p className="text-ink-500 text-[11px] mt-3 max-w-[260px]">
              Estimated from your weight and this workout's typical intensity — not a
              medical-grade measurement.
            </p>
          </div>
          <div className="flex flex-col gap-3 pb-6">
            <Button accentClass={a.solidBtn} onClick={() => navigate('/app/home')}>
              <HomeIcon size={16} /> Back to Home
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/app/day/${day.id}`)}>
              View Workout
            </Button>
          </div>
        </div>
      </PhoneShell>
    )
  }

  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0)
  const completedSets =
    day.exercises.slice(0, exIndex).reduce((s, e) => s + e.sets, 0) + (setNum - 1)
  const progressPct = Math.min(100, Math.round((completedSets / totalSets) * 100))

  const primaryLabel = phase === 'rest' ? 'Skip Rest' : exercise.type === 'time' ? 'Skip' : 'Mark Set Complete'

  return (
    <PhoneShell>
      <div className="px-5 pt-4 pb-6 flex flex-col min-h-full">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(`/app/day/${day.id}`)} className="text-ink-300" aria-label="Close">
            <X size={22} />
          </button>
          <p className="text-ink-400 text-xs font-semibold">{day.title}</p>
          <span className="w-[22px]" />
        </div>

        <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden mb-4">
          <div
            className={`h-full ${a.bg} transition-all duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {phase === 'rest' ? (
          <div className={`aspect-video rounded-3xl p-6 flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${a.grad}`}>
            <p className="text-ink-950/70 text-xs font-bold tracking-wide">REST</p>
            <p className="text-ink-950 text-5xl font-extrabold tabular-nums">{formatTime(timeLeft)}</p>
            <p className="text-ink-950/80 text-sm font-semibold text-center">Up next: {exercise.name}</p>
          </div>
        ) : (
          <>
            <VideoPlayer exerciseName={exercise.name} videoId={EXERCISE_VIDEOS[exercise.name]} />
            <p className="text-center text-white font-bold text-lg mt-3">{exercise.name}</p>
            {exercise.cue && <p className="text-center text-ink-400 text-xs mt-1 px-2">{exercise.cue}</p>}
          </>
        )}

        <p className="text-center text-ink-400 text-xs font-bold tracking-wide mt-5">
          EXERCISE {exIndex + 1} OF {day.exercises.length} · SET {setNum} OF {exercise.sets}
        </p>

        {phase === 'work' && (
          exercise.type === 'time' ? (
            <p className="text-center text-white text-5xl font-extrabold tabular-nums mt-2">{formatTime(timeLeft)}</p>
          ) : (
            <p className="text-center text-white text-5xl font-extrabold mt-2">
              {exercise.reps} <span className="text-lg text-ink-400 font-semibold">reps</span>
            </p>
          )
        )}

        <div className="mt-auto pt-6">
          <Button className="w-full" accentClass={a.solidBtn} onClick={handleAdvance}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </PhoneShell>
  )
}
