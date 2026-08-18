import { useEffect, useState } from 'react'
import { EXERCISE_PHOTOS } from '../data/exercisePhotos.js'
import ExerciseAnimation from './ExerciseAnimation.jsx'

// Real exercise photos, crossfaded on a loop to read like a GIF. Falls back
// to the illustrated animation for exercises with no good photo match, if a
// photo load errors, or if it just never finishes loading — a network
// failure like a connection reset doesn't always fire an <img> error event
// cleanly, so a load can hang forever without this timeout.
const LOAD_TIMEOUT_MS = 6000

export default function ExercisePhoto({ exerciseName, setsLabel, accentGrad }) {
  const images = EXERCISE_PHOTOS[exerciseName]
  const [frame, setFrame] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setFrame(0)
    setLoaded(false)
    setBroken(false)
  }, [exerciseName])

  useEffect(() => {
    if (!images || broken || loaded) return
    const timeout = setTimeout(() => setBroken(true), LOAD_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [images, broken, loaded, exerciseName])

  useEffect(() => {
    if (!images || images.length < 2 || broken || !loaded) return
    const id = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 700)
    return () => clearInterval(id)
  }, [images, broken, loaded])

  if (!images || broken) {
    return <ExerciseAnimation exerciseName={exerciseName} setsLabel={setsLabel} accentGrad={accentGrad} />
  }

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-ink-950">
      {!loaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${accentGrad} opacity-20`} />
      )}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={exerciseName}
          onLoad={() => i === 0 && setLoaded(true)}
          onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
          style={{ opacity: loaded && frame === i ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-x-0 top-0 p-4 z-10 bg-gradient-to-b from-black/70 via-black/20 to-transparent">
        {setsLabel && (
          <p className="text-white font-black text-4xl leading-none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {setsLabel}
          </p>
        )}
        <p className="text-white/90 font-extrabold text-xs tracking-wide uppercase mt-1.5 drop-shadow">
          {exerciseName}
        </p>
      </div>
    </div>
  )
}
