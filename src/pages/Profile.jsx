import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, RotateCcw, ShieldCheck, ExternalLink } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { GOALS } from '../data/programs.js'
import { accent } from '../lib/theme.js'
import { PHOTO_CREDITS } from '../data/exercisePhotos.js'

export default function Profile() {
  const navigate = useNavigate()
  const { auth, profile, subscription, signOut, cancelSubscription, resetDemo } = useApp()
  const a = accent(profile?.gender)
  const goal = GOALS.find((g) => g.id === profile?.goal)

  function handleLogout() {
    signOut()
    navigate('/')
  }

  function handleCancel() {
    cancelSubscription()
    navigate('/app/subscribe')
  }

  function handleReset() {
    resetDemo()
    navigate('/')
  }

  return (
    <PhoneShell nav>
      <div className="px-5 pb-8">
        <div className="flex items-center gap-3 pt-1">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-ink-950 ${a.bg}`}>
            {(auth?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{auth?.name || 'Athlete'}</p>
            <p className="text-ink-400 text-sm">{auth?.email}</p>
          </div>
        </div>

        {profile && (
          <>
            <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">YOUR PLAN</p>
            <div className="bg-ink-850 rounded-2xl divide-y divide-ink-800">
              <Row label="Training program" value={profile.gender === 'female' ? 'Female' : 'Male'} />
              <Row label="Age" value={`${profile.age} yrs`} />
              <Row label="Weight" value={`${profile.weight} ${profile.weightUnit}`} />
              <Row label="Goal" value={goal?.label || '—'} />
            </div>
            <button
              onClick={() => navigate('/app/onboarding')}
              className="mt-3 w-full flex items-center justify-between text-sm font-semibold text-ink-200 bg-ink-850 rounded-2xl px-4 py-3.5"
            >
              Edit plan details
              <ChevronRight size={16} className="text-ink-500" />
            </button>
          </>
        )}

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">MEMBERSHIP</p>
        <div className={`rounded-2xl p-4 border ${subscription?.active ? a.chip : 'border-ink-700 text-ink-300'}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <p className="font-bold text-sm">
              {subscription?.plan === 'admin'
                ? 'Admin — Free Access'
                : subscription?.active
                ? 'QualityWorkout Premium — $10/mo'
                : 'No active membership'}
            </p>
          </div>
          {subscription?.active && subscription.startedAt && (
            <p className="text-xs opacity-80 mt-1.5">
              Active since {new Date(subscription.startedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {subscription?.plan === 'admin' ? (
          <p className="mt-3 text-center text-xs text-ink-500">Comped internal account — no billing applies.</p>
        ) : subscription?.active ? (
          <button onClick={handleCancel} className="mt-3 w-full text-center text-sm font-semibold text-ink-400 py-2">
            Cancel membership
          </button>
        ) : (
          <Button className="mt-3 w-full" onClick={() => navigate('/app/subscribe')}>
            Subscribe — $10/mo
          </Button>
        )}

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">ACCOUNT</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 text-sm font-semibold text-ink-200 bg-ink-850 rounded-2xl px-4 py-3.5"
        >
          <LogOut size={16} /> Log out
        </button>
        <button
          onClick={handleReset}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold text-ink-500 py-2"
        >
          <RotateCcw size={13} /> Reset demo data
        </button>

        <p className="text-ink-400 text-xs font-bold tracking-wide mt-8 mb-2">PHOTO CREDITS</p>
        <div className="bg-ink-850 rounded-2xl divide-y divide-ink-800 overflow-hidden">
          {PHOTO_CREDITS.map((c) => (
            <a
              key={c.exercise}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-ink-800 transition"
            >
              <span className="min-w-0">
                <p className="text-ink-200 font-semibold truncate">{c.exercise}</p>
                <p className="text-ink-500 text-xs truncate">{c.author} · {c.license}</p>
              </span>
              <ExternalLink size={14} className="text-ink-500 shrink-0" />
            </a>
          ))}
        </div>
        <p className="text-ink-500 text-[11px] mt-2">
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
      <span className="text-ink-400">{label}</span>
      <span className="text-ink-200 font-semibold">{value}</span>
    </div>
  )
}
