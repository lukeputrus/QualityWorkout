import { Sparkles } from 'lucide-react'
import { EXERCISE_PATTERNS, PATTERN_LABELS } from '../data/movementPatterns.js'

// Self-contained animated demonstration — no video, no network request, no
// ads, never "unavailable". A simple figure animates through the exercise's
// movement pattern (squat, hinge, push, pull, curl, etc.) on a loop.
const ARM_PATTERNS = new Set([
  'push-horizontal',
  'push-overhead',
  'pull-vertical',
  'pull-horizontal',
  'curl',
  'extension',
  'raise',
])

export default function ExerciseAnimation({ exerciseName, accentHex }) {
  const pattern = EXERCISE_PATTERNS[exerciseName] || 'stretch'
  const label = PATTERN_LABELS[pattern]
  const showIndicator = ARM_PATTERNS.has(pattern)

  return (
    <div className={`anim-${pattern} relative w-full aspect-video rounded-3xl overflow-hidden bg-ink-950 flex flex-col items-center justify-center gap-2`}>
      <div
        className="absolute -inset-10 opacity-20 blur-2xl"
        style={{ background: `radial-gradient(circle, ${accentHex}, transparent 60%)` }}
      />

      <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-ink-800/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
        <Sparkles size={12} style={{ color: accentHex }} />
        MOVEMENT DEMO
      </span>

      <svg viewBox="0 0 120 160" className="relative w-28 h-36" style={{ overflow: 'visible' }}>
        <g className="fig-body-group">
          <circle cx="60" cy="28" r="14" fill={accentHex} />
          <rect x="40" y="46" width="40" height="66" rx="20" fill={accentHex} opacity="0.85" />
          <rect x="46" y="108" width="28" height="42" rx="14" fill={accentHex} opacity="0.65" />
        </g>
        {showIndicator && <circle className="fig-indicator" cx="90" cy="74" r="7" fill="white" />}
      </svg>
      <p className="relative text-ink-300 text-xs font-semibold tracking-wide">{label}</p>
    </div>
  )
}
