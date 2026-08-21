export function accent(gender) {
  if (gender === 'female') {
    return {
      text: 'text-sage-600',
      bg: 'bg-sage-500',
      bgHex: '#84906c',
      solidBtn: 'bg-sage-500 text-white hover:bg-sage-600',
      ring: 'ring-sage-500',
      chip: 'bg-sage-500/10 text-sage-600 border-sage-500/30',
      grad: 'from-sage-400 to-sage-600',
    }
  }
  return {
    text: 'text-terracotta-600',
    bg: 'bg-terracotta-500',
    bgHex: '#c1653f',
    solidBtn: 'bg-terracotta-500 text-white hover:bg-terracotta-600',
    ring: 'ring-terracotta-500',
    chip: 'bg-terracotta-500/10 text-terracotta-600 border-terracotta-500/30',
    grad: 'from-terracotta-400 to-terracotta-600',
  }
}
