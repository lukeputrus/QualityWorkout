import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, RotateCcw, Sparkles, ExternalLink, UserPlus } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { GOALS } from '../data/programs.js'
import { accent } from '../lib/theme.js'
import { PHOTO_CREDITS } from '../data/exercisePhotos.js'

export default function Profile() {
  const navigate = useNavigate()
  const { auth, profile, signOut, resetDemo } = useApp()
  const a = accent(profile?.gender)
  const goal = GOALS.find((g) => g.id === profile?.goal)

  function handleLogout() {
    signOut()
    navigate('/')
  }

  function handleReset() {
    resetDemo()
    navigate('/')
  }

  return (
    <PhoneShell nav>
      <div className="px-5 pb-8">
        <div className="flex items-center gap-3 pt-1">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white ${a.bg}`}>
            {(auth?.name || 'G')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-serif text-ink-950 font-semibold text-lg">{auth?.name || 'Guest'}</p>
            <p className="text-ink-600 text-sm">{auth?.email || 'No account yet'}</p>
          </div>
        </div>

        {profile && (
          <>
            <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">YOUR PLAN</p>
            <div className="bg-white border border-cream-300 rounded-2xl divide-y divide-cream-200">
              <Row label="Training program" value={profile.gender === 'female' ? 'Female' : 'Male'} />
              <Row label="Age" value={`${profile.age} yrs`} />
              <Row label="Weight" value={`${profile.weight} ${profile.weightUnit}`} />
              <Row label="Goal" value={goal?.label || '—'} />
            </div>
            <button
              onClick={() => navigate('/app/onboarding')}
              className="mt-3 w-full flex items-center justify-between text-sm font-semibold text-ink-800 bg-white border border-cream-300 rounded-2xl px-4 py-3.5"
            >
              Edit plan details
              <ChevronRight size={16} className="text-ink-400" />
            </button>
          </>
        )}

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">MEMBERSHIP</p>
        <div className={`rounded-2xl p-4 border ${a.chip}`}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            <p className="font-bold text-sm">Full access — free during preview</p>
          </div>
          <p className="text-xs opacity-80 mt-1.5">
            No subscription, ever. When the iOS &amp; Android apps launch, unlocking them will be a
            single one-time purchase — no monthly fee.
          </p>
        </div>

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">ACCOUNT</p>
        {auth ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-sm font-semibold text-ink-800 bg-white border border-cream-300 rounded-2xl px-4 py-3.5"
          >
            <LogOut size={16} /> Log out
          </button>
        ) : (
          <>
            <p className="text-ink-600 text-sm mb-3">
              You're using QualityWorkout as a guest — your plan is saved on this device. Creating
              an account is optional and only useful if you want it to follow you elsewhere.
            </p>
            <Button className="w-full" onClick={() => navigate('/app/signup')}>
              <UserPlus size={16} /> Create an account
            </Button>
          </>
        )}
        <button
          onClick={handleReset}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold text-ink-400 py-2"
        >
          <RotateCcw size={13} /> Reset demo data
        </button>

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">PHOTO CREDITS</p>
        <div className="bg-white border border-cream-300 rounded-2xl divide-y divide-cream-200 overflow-hidden">
          {PHOTO_CREDITS.map((c) => (
            <a
              key={c.exercise}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-cream-100 transition"
            >
              <span className="min-w-0">
                <p className="text-ink-800 font-semibold truncate">{c.exercise}</p>
                <p className="text-ink-400 text-xs truncate">{c.author} · {c.license}</p>
              </span>
              <ExternalLink size={14} className="text-ink-400 shrink-0" />
            </a>
          ))}
        </div>
        <p className="text-ink-400 text-[11px] mt-2">
          Most exercise photos are from the public-domain free-exercise-db
          dataset (no credit required). The ones above are Creative
          Commons licensed and credited here per their terms.
        </p>
      </div>
    </PhoneShell>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 text-sm">
      <span className="text-ink-600">{label}</span>
      <span className="text-ink-800 font-semibold">{value}</span>
    </div>
  )
}
