import { useEffect, useRef, useState } from 'react'
import { Radio, Youtube, ExternalLink, Loader2 } from 'lucide-react'

// Loads the YouTube IFrame Player API once and reuses it across mounts, so
// we can detect a genuinely broken/removed video (onError) and show a real
// fallback instead of YouTube's own blank "video unavailable" placeholder.
let apiPromise = null
function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.onerror = () => resolve(null)
    document.head.appendChild(tag)
  })
  return apiPromise
}

// videoId is a curated, hand-picked YouTube video ID for this exact
// exercise (see src/data/exerciseVideos.js). If none is mapped yet, or the
// mapped video turns out to be unavailable, this shows a "search on
// YouTube" link instead of a broken player.
export default function VideoPlayer({ exerciseName, videoId }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const [status, setStatus] = useState(videoId ? 'loading' : 'no-id')

  useEffect(() => {
    setStatus(videoId ? 'loading' : 'no-id')
    if (!videoId) return

    let cancelled = false
    // Safety net: if the API script is blocked (ad blockers commonly block
    // youtube.com) or ready/error never fires, fall back instead of
    // spinning forever.
    const timeout = setTimeout(() => !cancelled && setStatus('error'), 8000)

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled) return
      if (!YT || !containerRef.current) {
        setStatus('error')
        return
      }
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            clearTimeout(timeout)
            if (!cancelled) setStatus('ready')
          },
          onError: () => {
            clearTimeout(timeout)
            if (!cancelled) setStatus('error')
          },
        },
      })
    })

    return () => {
      cancelled = true
      clearTimeout(timeout)
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [videoId])

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${exerciseName} exercise proper form tutorial`,
  )}`

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-ink-950">
      {status !== 'no-id' && status !== 'error' && (
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      )}

      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          {status === 'loading' ? (
            <Loader2 size={22} className="text-ink-500 animate-spin" />
          ) : (
            <>
              <Youtube size={26} className="text-ink-500" />
              <p className="text-ink-300 text-sm font-semibold">
                {status === 'no-id'
                  ? 'No demo video linked yet for this exercise'
                  : 'This demo video is no longer available'}
              </p>
              <a
                href={searchUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-ink-700 hover:bg-ink-600 transition px-3 py-2 rounded-xl"
              >
                Search on YouTube <ExternalLink size={12} />
              </a>
            </>
          )}
        </div>
      )}

      <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
        <Radio size={12} />
        DEMO VIDEO
      </span>
    </div>
  )
}
