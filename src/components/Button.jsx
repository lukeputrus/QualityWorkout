export default function Button({
  children,
  variant = 'primary',
  className = '',
  accentClass = 'bg-lime-400 text-ink-950 hover:bg-lime-500',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold px-5 py-3.5 text-[15px] transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: accentClass,
    secondary: 'bg-ink-800 text-ink-200 hover:bg-ink-700 border border-ink-700',
    ghost: 'bg-transparent text-ink-200 hover:bg-ink-800',
    outline: 'bg-transparent border border-ink-600 text-ink-200 hover:bg-ink-800',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
