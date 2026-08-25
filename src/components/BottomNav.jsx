import { NavLink } from 'react-router-dom'
import { Home, UtensilsCrossed, User } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { accent } from '../lib/theme.js'

export default function BottomNav() {
  const { profile } = useApp()
  const a = accent(profile?.gender)

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[11px] font-medium transition ${
      isActive ? a.text : 'text-ink-400'
    }`

  return (
    <div className="relative z-20 flex items-stretch border-t border-cream-300 bg-cream-50/95 backdrop-blur px-2 pb-2 pt-1">
      <NavLink to="/app/home" className={linkClass}>
        <Home size={20} />
        Home
      </NavLink>
      <NavLink to="/app/nutrition" className={linkClass}>
        <UtensilsCrossed size={20} />
        Nutrition
      </NavLink>
      <NavLink to="/app/profile" className={linkClass}>
        <User size={20} />
        Profile
      </NavLink>
    </div>
  )
}
