// Curated per-exercise YouTube video IDs, keyed by exact exercise name.
// Populated by hand (verified via search) rather than the old
// listType=search embed trick, which YouTube no longer supports reliably —
// it was showing "This video is unavailable" in production. Exercises not
// yet in this map fall back to a "search on YouTube" link in VideoPlayer
// instead of a broken embed. See VideoPlayer.jsx.
export const EXERCISE_VIDEOS = {}
