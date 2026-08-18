import { Link } from 'react-router-dom'
import { Dumbbell, Radio, Users, Target, Check, Apple, PlayCircle } from 'lucide-react'
import { PROGRAMS } from '../data/programs.js'

function NavBar() {
  return (
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2 font-extrabold text-lg text-white">
        <span className="w-8 h-8 rounded-xl bg-lime-400 text-ink-950 flex items-center justify-center">
          <Dumbbell size={18} />
        </span>
        QualityWorkout
      </div>
      <div className="hidden sm:flex items-center gap-8 text-sm text-ink-200">
        <a href="#how" className="hover:text-white transition">How it works</a>
        <a href="#programs" className="hover:text-white transition">Programs</a>
        <a href="#pricing" className="hover:text-white transition">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/app/login" className="text-sm text-ink-200 hover:text-white transition hidden sm:block">
          Log in
        </Link>
        <Link
          to="/app/signup"
          className="text-sm font-semibold bg-lime-400 text-ink-950 px-4 py-2.5 rounded-xl hover:bg-lime-500 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}

function MockPhonePreview() {
  const rows = [
    { label: 'Chest Day', sub: '5 exercises · 42 min', tone: 'from-lime-400 to-emerald-500' },
    { label: 'Back Day', sub: '5 exercises · 38 min', tone: 'from-lime-400 to-emerald-500' },
    { label: 'Leg Day', sub: '5 exercises · 45 min', tone: 'from-lime-400 to-emerald-500' },
  ]
  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <div className="absolute -inset-8 bg-lime-400/20 blur-3xl rounded-full" />
      <div className="relative bg-ink-900 border border-white/10 rounded-[2.25rem] shadow-phone p-3">
        <div className="bg-ink-950 rounded-[1.75rem] overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-[11px] text-ink-400">Tuesday, Chest &amp; Triceps</p>
            <p className="text-white font-bold text-lg">Today's Workout</p>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 bg-ink-850 rounded-2xl p-2.5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.tone} flex items-center justify-center text-ink-950`}>
                  <Dumbbell size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{r.label}</p>
                  <p className="text-ink-400 text-[11px]">{r.sub}</p>
                </div>
              </div>
            ))}
            <div className="mt-1 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-ink-950 text-center text-sm font-bold py-3">
              ▶ Start Live Follow-Along
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-400 bg-lime-400/10 border border-lime-400/30 px-3 py-1.5 rounded-full mb-6">
          <Radio size={12} /> Live follow-along coaching
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.08] tracking-tight">
          A workout plan built around <span className="text-lime-400">you</span>.
        </h1>
        <p className="mt-5 text-ink-400 text-lg max-w-md">
          Tell us your age, weight and goal. Get a personalized training split — with
          separate programming for men and women — and follow along on every set with
          live timers and a movement demo for each exercise.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/app/signup"
            className="bg-lime-400 text-ink-950 font-bold px-6 py-3.5 rounded-2xl hover:bg-lime-500 transition"
          >
            Start Your Plan
          </Link>
          <a
            href="#pricing"
            className="border border-ink-600 text-ink-200 font-semibold px-6 py-3.5 rounded-2xl hover:bg-ink-800 transition"
          >
            See Pricing — $10/mo
          </a>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <span className="flex items-center gap-2 text-ink-400 text-xs border border-ink-700 rounded-xl px-3 py-2">
            <Apple size={16} /> App Store — coming soon
          </span>
          <span className="flex items-center gap-2 text-ink-400 text-xs border border-ink-700 rounded-xl px-3 py-2">
            <PlayCircle size={16} /> Google Play — coming soon
          </span>
        </div>
      </div>
      <MockPhonePreview />
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { icon: Users, title: 'Tell us about you', body: 'Sex, age, weight and your #1 goal — takes 30 seconds.' },
    { icon: Target, title: 'Get your plan', body: 'A weekly split built for your goal, programmed differently for men and women.' },
    { icon: Radio, title: 'Follow along live', body: 'Every workout day plays like a live class — reps, rest timers and form cues included.' },
  ]
  return (
    <div id="how" className="max-w-6xl mx-auto px-6 py-20 border-t border-ink-800">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center">How QualityWorkout works</h2>
      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="bg-ink-900 border border-ink-800 rounded-3xl p-6">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center mb-4">
              <s.icon size={20} />
            </div>
            <p className="text-xs font-bold text-lime-400 mb-1">STEP {i + 1}</p>
            <p className="text-white font-bold text-lg">{s.title}</p>
            <p className="text-ink-400 text-sm mt-2">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgramsPreview() {
  return (
    <div id="programs" className="max-w-6xl mx-auto px-6 py-20 border-t border-ink-800">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
        Different bodies, different programming
      </h2>
      <p className="text-ink-400 text-center mt-3 max-w-xl mx-auto">
        The male and female programs share the same coaching quality but a different weekly
        split, so training matches how you actually want to train.
      </p>
      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        <div className="bg-ink-900 border border-ink-800 rounded-3xl p-6">
          <p className="text-lime-400 font-bold text-sm mb-4">MALE PROGRAM</p>
          <ul className="space-y-2.5">
            {PROGRAMS.male.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-200">{d.emoji} {d.title}</span>
                <span className="text-ink-400">{d.focus}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-ink-900 border border-ink-800 rounded-3xl p-6">
          <p className="text-bloom-400 font-bold text-sm mb-4">FEMALE PROGRAM</p>
          <ul className="space-y-2.5">
            {PROGRAMS.female.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-200">{d.emoji} {d.title}</span>
                <span className="text-ink-400">{d.focus}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Pricing() {
  const features = [
    'Personalized plan from your age, weight & goal',
    'Live follow-along timers with a movement demo for every exercise',
    'Male and female specific programming',
    'Rest timers, set tracking & form cues',
    'Cancel anytime',
  ]
  return (
    <div id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-ink-800">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center">Simple pricing</h2>
      <div className="mt-10 max-w-sm mx-auto bg-gradient-to-b from-ink-900 to-ink-850 border border-ink-700 rounded-3xl p-8 text-center">
        <p className="text-ink-400 text-sm font-semibold">QualityWorkout Premium</p>
        <p className="mt-2 text-5xl font-extrabold text-white">
          $10<span className="text-lg text-ink-400 font-semibold">/mo</span>
        </p>
        <ul className="mt-6 space-y-3 text-left">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-ink-200">
              <Check size={16} className="text-lime-400 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          to="/app/signup"
          className="mt-8 block bg-lime-400 text-ink-950 font-bold py-3.5 rounded-2xl hover:bg-lime-500 transition"
        >
          Start Your Plan
        </Link>
        <p className="mt-3 text-[11px] text-ink-400">
          This preview simulates checkout — no real card is charged.
        </p>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950">
      <NavBar />
      <Hero />
      <HowItWorks />
      <ProgramsPreview />
      <Pricing />
      <footer className="border-t border-ink-800 py-10 text-center text-ink-400 text-xs">
        QualityWorkout — early preview build. Not affiliated with any app store listing yet.
      </footer>
    </div>
  )
}
