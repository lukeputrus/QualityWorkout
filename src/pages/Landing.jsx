import { Link } from 'react-router-dom'
import { Dumbbell, Radio, Users, Target, Check, Apple, PlayCircle } from 'lucide-react'
import { PROGRAMS } from '../data/programs.js'

function NavBar() {
  return (
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2 font-serif font-semibold text-lg text-ink-950">
        <span className="w-8 h-8 rounded-xl bg-terracotta-500 text-white flex items-center justify-center">
          <Dumbbell size={18} />
        </span>
        QualityWorkout
      </div>
      <div className="hidden sm:flex items-center gap-8 text-sm text-ink-800">
        <a href="#how" className="hover:text-ink-950 transition">How it works</a>
        <a href="#programs" className="hover:text-ink-950 transition">Programs</a>
        <a href="#pricing" className="hover:text-ink-950 transition">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/app/login" className="text-sm text-ink-800 hover:text-ink-950 transition hidden sm:block">
          Log in
        </Link>
        <Link
          to="/app/onboarding"
          className="text-sm font-semibold bg-terracotta-500 text-white px-4 py-2.5 rounded-xl hover:bg-terracotta-600 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}

function MockPhonePreview() {
  const rows = [
    { label: 'Chest Day', sub: '5 exercises · 42 min' },
    { label: 'Back Day', sub: '5 exercises · 38 min' },
    { label: 'Leg Day', sub: '5 exercises · 45 min' },
  ]
  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <div className="absolute -inset-8 bg-terracotta-400/20 blur-3xl rounded-full" />
      <div className="relative bg-cream-50 border border-cream-300 rounded-[2.25rem] shadow-phone p-3">
        <div className="bg-cream-100 rounded-[1.75rem] overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-[11px] text-ink-400">Tuesday, Chest &amp; Triceps</p>
            <p className="font-serif text-ink-950 font-semibold text-lg">Today's Workout</p>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 bg-white border border-cream-300 rounded-2xl p-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center text-white">
                  <Dumbbell size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-ink-950 text-sm font-semibold">{r.label}</p>
                  <p className="text-ink-400 text-[11px]">{r.sub}</p>
                </div>
              </div>
            ))}
            <div className="mt-1 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-white text-center text-sm font-bold py-3">
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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-600 bg-terracotta-500/10 border border-terracotta-500/30 px-3 py-1.5 rounded-full mb-6">
          <Radio size={12} /> Live follow-along coaching
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink-950 leading-[1.1] tracking-tight">
          A workout plan built around <span className="text-terracotta-600">you</span>.
        </h1>
        <p className="mt-5 text-ink-600 text-lg max-w-md">
          Tell us your age, weight and goal. Get a personalized training split — with
          separate programming for men and women — and follow along on every set with
          live timers and a movement demo for each exercise.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/app/onboarding"
            className="bg-terracotta-500 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-terracotta-600 transition"
          >
            Start Your Plan
          </Link>
          <a
            href="#pricing"
            className="border border-ink-300 text-ink-800 font-semibold px-6 py-3.5 rounded-2xl hover:bg-cream-200 transition"
          >
            What it costs
          </a>
        </div>
        <p className="mt-4 text-ink-400 text-xs">No account or payment needed to start — it's free to preview.</p>
        <div className="mt-6 flex items-center gap-3">
          <span className="flex items-center gap-2 text-ink-600 text-xs border border-ink-300 rounded-xl px-3 py-2">
            <Apple size={16} /> App Store — coming soon
          </span>
          <span className="flex items-center gap-2 text-ink-600 text-xs border border-ink-300 rounded-xl px-3 py-2">
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
    { icon: Users, title: 'Tell us about you', body: 'Sex, age, weight and your #1 goal — takes 30 seconds, no account required.' },
    { icon: Target, title: 'Get your plan', body: 'A weekly split built for your goal, programmed differently for men and women.' },
    { icon: Radio, title: 'Follow along live', body: 'Every workout day plays like a live class — reps, rest timers and form cues included.' },
  ]
  return (
    <div id="how" className="max-w-6xl mx-auto px-6 py-20 border-t border-cream-300">
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-950 text-center">How QualityWorkout works</h2>
      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="bg-white border border-cream-300 rounded-3xl p-6">
            <div className="w-10 h-10 rounded-xl bg-terracotta-500/10 text-terracotta-600 flex items-center justify-center mb-4">
              <s.icon size={20} />
            </div>
            <p className="text-xs font-bold text-terracotta-600 mb-1">STEP {i + 1}</p>
            <p className="text-ink-950 font-bold text-lg">{s.title}</p>
            <p className="text-ink-600 text-sm mt-2">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgramsPreview() {
  return (
    <div id="programs" className="max-w-6xl mx-auto px-6 py-20 border-t border-cream-300">
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-950 text-center">
        Different bodies, different programming
      </h2>
      <p className="text-ink-600 text-center mt-3 max-w-xl mx-auto">
        The male and female programs share the same coaching quality but a different weekly
        split, so training matches how you actually want to train.
      </p>
      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        <div className="bg-white border border-cream-300 rounded-3xl p-6">
          <p className="text-terracotta-600 font-bold text-sm mb-4">MALE PROGRAM</p>
          <ul className="space-y-2.5">
            {PROGRAMS.male.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-800">{d.emoji} {d.title}</span>
                <span className="text-ink-400">{d.focus}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-cream-300 rounded-3xl p-6">
          <p className="text-sage-600 font-bold text-sm mb-4">FEMALE PROGRAM</p>
          <ul className="space-y-2.5">
            {PROGRAMS.female.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-800">{d.emoji} {d.title}</span>
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
  ]
  return (
    <div id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-cream-300">
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-950 text-center">Free to try. No subscription.</h2>
      <div className="mt-10 max-w-sm mx-auto bg-white border border-cream-300 rounded-3xl p-8 text-center">
        <p className="text-ink-600 text-sm font-semibold">This preview</p>
        <p className="mt-2 font-serif text-5xl font-semibold text-ink-950">
          Free
        </p>
        <p className="text-ink-400 text-xs mt-2">No account, no card, no monthly fee — ever.</p>
        <ul className="mt-6 space-y-3 text-left">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-ink-800">
              <Check size={16} className="text-terracotta-600 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          to="/app/onboarding"
          className="mt-8 block bg-terracotta-500 text-white font-bold py-3.5 rounded-2xl hover:bg-terracotta-600 transition"
        >
          Start Your Plan
        </Link>
        <p className="mt-3 text-[11px] text-ink-400">
          When the iOS &amp; Android apps launch, unlocking them will be a single
          one-time purchase — never a subscription. Creating an account is optional too.
        </p>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-100">
      <NavBar />
      <Hero />
      <HowItWorks />
      <ProgramsPreview />
      <Pricing />
      <footer className="border-t border-cream-300 py-10 text-center text-ink-400 text-xs">
        QualityWorkout — early preview build. Not affiliated with any app store listing yet.
      </footer>
    </div>
  )
}
