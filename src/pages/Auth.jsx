import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Auth({ mode }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const { signIn, profile, subscription } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    signIn({ name: name || email.split('@')[0] || 'Athlete', email })

    if (!profile?.gender || !profile?.goal) {
      navigate('/app/onboarding')
    } else if (!subscription?.active) {
      navigate('/app/subscribe')
    } else {
      navigate('/app/home')
    }
  }

  return (
    <PhoneShell>
      <div className="px-6 pt-8 pb-10 flex flex-col min-h-full">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="w-14 h-14 rounded-2xl bg-lime-400 text-ink-950 flex items-center justify-center mb-4">
            <Dumbbell size={26} />
          </span>
          <h1 className="text-xl font-extrabold text-white">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {isSignup ? 'Start your personalized plan in under a minute.' : 'Log in to continue your plan.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isSignup && (
            <div>
              <label className="text-xs font-semibold text-ink-400">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jamie Rivera"
                className="mt-1.5 w-full bg-ink-850 border border-ink-700 rounded-2xl px-4 py-3.5 text-white placeholder-ink-400 outline-none focus:border-lime-400"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-ink-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full bg-ink-850 border border-ink-700 rounded-2xl px-4 py-3.5 text-white placeholder-ink-400 outline-none focus:border-lime-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-400">Password</label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full bg-ink-850 border border-ink-700 rounded-2xl px-4 py-3.5 text-white placeholder-ink-400 outline-none focus:border-lime-400"
            />
          </div>

          <Button type="submit" className="mt-3 w-full">
            {isSignup ? 'Create Account' : 'Log In'}
          </Button>
        </form>

        <p className="text-center text-ink-400 text-sm mt-6">
          {isSignup ? (
            <>Already have an account? <Link to="/app/login" className="text-lime-400 font-semibold">Log in</Link></>
          ) : (
            <>New here? <Link to="/app/signup" className="text-lime-400 font-semibold">Create an account</Link></>
          )}
        </p>

        <p className="text-center text-ink-400/70 text-[11px] mt-auto pt-8">
          This is a preview build. Accounts are stored only in your browser — no real
          signup data is sent anywhere.
        </p>
      </div>
    </PhoneShell>
  )
}
