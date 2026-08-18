import { Radio } from 'lucide-react'

// Real per-exercise demonstration video. Rather than hand-picking a video ID
// for every exercise, this embeds YouTube's own "search" playlist type so it
// always shows a relevant instructional video for whatever exercise name is
// passed in — see https://developers.google.com/youtube/player_parameters
// (listType=search). This pulls live, unreviewed YouTube content, which is
// fine for a prototype but should be swapped for curated/licensed footage
// (or at least a vetted video ID per exercise) before a real launch.
export default function VideoPlayer({ exerciseName }) {
  const query = `${exerciseName} exercise proper form tutorial`
  const src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&rel=0&modestbranding=1`

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-ink-950">
      <iframe
        key={exerciseName}
        src={src}
        title={`${exerciseName} demonstration`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
      <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
        <Radio size={12} />
        DEMO VIDEO
      </span>
    </div>
  )
}
