export default function Button({
  children,
  variant = 'primary',
  className = '',
  accentClass = 'bg-terracotta-500 text-white hover:bg-terracotta-600',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold px-5 py-3.5 text-[15px] transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: accentClass,
    secondary: 'bg-cream-200 text-ink-800 hover:bg-cream-300 border border-cream-300',
    ghost: 'bg-transparent text-ink-800 hover:bg-cream-200',
    outline: 'bg-transparent border border-ink-300 text-ink-800 hover:bg-cream-200',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
