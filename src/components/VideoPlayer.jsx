import { Play, Pause, Radio } from 'lucide-react'

// Simulated "live follow-along" video surface. This is a visual placeholder —
// no real video is streamed. Swap in a real player (Mux, Cloudflare Stream,
// hosted MP4, etc.) here once licensed workout footage is ready. See README.
export default function VideoPlayer({ exerciseName, cue, playing, onToggle, accentGrad }) {
  return (
    <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-ink-950">
      <div
        className={`absolute -inset-10 bg-gradient-to-br ${accentGrad} opacity-30 blur-2xl transition-transform duration-[3000ms] ease-in-out ${
          playing ? 'scale-125 rotate-6' : 'scale-100'
        }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 bg-red-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Radio size={12} className={playing ? 'animate-pulse' : ''} />
            LIVE FOLLOW-ALONG
          </span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggle}
            className="relative w-20 h-20 rounded-full bg-white/95 text-ink-950 flex items-center justify-center shadow-xl active:scale-95 transition"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing && <span className="pulse-ring absolute inset-0 text-white/60" />}
            {playing ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
          </button>
          <div className="text-center px-4">
            <p className="text-white font-bold text-lg drop-shadow">{exerciseName}</p>
            {cue && <p className="text-white/70 text-xs mt-1 max-w-[260px] mx-auto">{cue}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
