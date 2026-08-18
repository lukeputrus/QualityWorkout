export function accent(gender) {
  if (gender === 'female') {
    return {
      text: 'text-bloom-400',
      bg: 'bg-bloom-400',
      bgHex: '#ff5fa2',
      solidBtn: 'bg-bloom-400 text-ink-950 hover:bg-bloom-500',
      ring: 'ring-bloom-400',
      chip: 'bg-bloom-400/10 text-bloom-400 border-bloom-400/30',
      grad: 'from-bloom-500 via-fuchsia-600 to-purple-700',
    }
  }
  return {
    text: 'text-lime-400',
    bg: 'bg-lime-400',
    bgHex: '#c6ff3d',
    solidBtn: 'bg-lime-400 text-ink-950 hover:bg-lime-500',
    ring: 'ring-lime-400',
    chip: 'bg-lime-400/10 text-lime-400 border-lime-400/30',
    grad: 'from-lime-400 via-emerald-500 to-teal-600',
  }
}
