import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, ShieldCheck } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { accent } from '../lib/theme.js'

const FEATURES = [
  'Personalized plan from your age, weight & goal',
  'Live follow-along timers with a movement demo for every exercise',
  'Male and female specific programming',
  'Rest timers, set tracking & form cues',
  'Cancel anytime',
]

export default function Subscribe() {
  const navigate = useNavigate()
  const { profile, subscribe } = useApp()
  const a = accent(profile?.gender)
  const [loading, setLoading] = useState(false)

  function handleSubscribe() {
    setLoading(true)
    // Simulated checkout — no real payment provider is wired up yet.
    // See SUBSCRIPTION_SETUP.md for how to connect real Stripe billing + payouts.
    setTimeout(() => {
      subscribe('monthly')
      setLoading(false)
      navigate('/app/home')
    }, 1400)
  }

  return (
    <PhoneShell>
      <div className="px-6 pb-8 flex flex-col min-h-full">
        <div className="text-center mt-4 mb-6">
          <h1 className="text-2xl font-extrabold text-white">Unlock your full plan</h1>
          <p className="text-ink-400 text-sm mt-2">
            One membership, every live follow-along workout, tailored to you.
          </p>
        </div>

        <div className={`rounded-3xl border-2 border-current ${a.chip} p-6 text-center`}>
          <p className="text-xs font-bold tracking-wide">QUALITYWORKOUT PREMIUM</p>
          <p className="mt-2 text-5xl font-extrabold text-white">
            $10<span className="text-base text-ink-400 font-semibold">/month</span>
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-ink-200">
              <Check size={16} className={`${a.text} mt-0.5 shrink-0`} />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Button className="w-full" accentClass={a.solidBtn} onClick={handleSubscribe} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing…
              </>
            ) : (
              'Start Membership — $10/mo'
            )}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-400 mt-4">
            <ShieldCheck size={13} />
            Preview mode — checkout is simulated, no card is charged.
          </p>
        </div>
      </div>
    </PhoneShell>
  )
}
