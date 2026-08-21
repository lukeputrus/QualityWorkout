import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Check } from 'lucide-react'
import PhoneShell from '../components/PhoneShell.jsx'
import Button from '../components/Button.jsx'
import { useApp } from '../context/AppContext.jsx'
import { GOALS } from '../data/programs.js'
import { accent } from '../lib/theme.js'

const STEPS = ['gender', 'age', 'weight', 'goal']

export default function Onboarding() {
  const navigate = useNavigate()
  const { saveProfile, profile } = useApp()
  const [step, setStep] = useState(0)
  const [gender, setGender] = useState(profile?.gender || null)
  const [age, setAge] = useState(profile?.age || 25)
  const [weight, setWeight] = useState(profile?.weight || 150)
  const [weightUnit, setWeightUnit] = useState(profile?.weightUnit || 'lb')
  const [goal, setGoal] = useState(profile?.goal || null)

  const a = accent(gender)
  const canContinue =
    (step === 0 && gender) ||
    (step === 1 && age >= 13 && age <= 90) ||
    (step === 2 && weight >= 60 && weight <= 500) ||
    (step === 3 && goal)

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      saveProfile({ gender, age, weight, weightUnit, goal })
      navigate('/app/home')
    }
  }

  return (
    <PhoneShell>
      <div className="px-6 pb-8 flex flex-col min-h-full">
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? a.bg : 'bg-cream-300'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <StepWrap title="Who's training?" subtitle="Programming differs between our male and female plans.">
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[
                { id: 'male', label: 'Male', emoji: '🏋️‍♂️' },
                { id: 'female', label: 'Female', emoji: '🏋️‍♀️' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className={`aspect-square rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition ${
                    gender === g.id
                      ? `${accent(g.id).chip} border-current`
                      : 'border-cream-300 bg-cream-100 text-ink-600'
                  }`}
                >
                  <span className="text-4xl">{g.emoji}</span>
                  <span className="font-bold">{g.label}</span>
                </button>
              ))}
            </div>
          </StepWrap>
        )}

        {step === 1 && (
          <StepWrap title="How old are you?" subtitle="This helps us set safe starting intensity.">
            <div className="flex items-center justify-center gap-6 mt-10">
              <RoundIconButton onClick={() => setAge((v) => Math.max(13, v - 1))}>
                <Minus size={20} />
              </RoundIconButton>
              <div className="font-serif text-5xl font-semibold text-ink-950 w-28 text-center tabular-nums">{age}</div>
              <RoundIconButton onClick={() => setAge((v) => Math.min(90, v + 1))}>
                <Plus size={20} />
              </RoundIconButton>
            </div>
            <p className="text-center text-ink-600 text-sm mt-2">years old</p>
            <Slider min={13} max={90} value={age} onChange={setAge} accentHex={a.bgHex} className="mt-8" />
          </StepWrap>
        )}

        {step === 2 && (
          <StepWrap title="What's your weight?" subtitle="We'll use this to calibrate your plan over time.">
            <div className="flex items-center justify-center gap-6 mt-10">
              <RoundIconButton onClick={() => setWeight((v) => Math.max(60, v - 5))}>
                <Minus size={20} />
              </RoundIconButton>
              <div className="font-serif text-5xl font-semibold text-ink-950 w-32 text-center tabular-nums">{weight}</div>
              <RoundIconButton onClick={() => setWeight((v) => Math.min(500, v + 5))}>
                <Plus size={20} />
              </RoundIconButton>
            </div>
            <Slider min={60} max={500} value={weight} onChange={setWeight} accentHex={a.bgHex} className="mt-6" />
            <div className="flex justify-center gap-2 mt-6">
              {['lb', 'kg'].map((u) => (
                <button
                  key={u}
                  onClick={() => setWeightUnit(u)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                    weightUnit === u ? `${a.bg} text-white` : 'bg-cream-200 text-ink-600'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </StepWrap>
        )}

        {step === 3 && (
          <StepWrap title="What's your main goal?" subtitle="Your weekly split is built around this.">
            <div className="flex flex-col gap-2.5 mt-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`flex items-center justify-between text-left rounded-2xl border-2 px-4 py-3.5 transition ${
                    goal === g.id ? `${a.chip} border-current` : 'border-cream-300 bg-cream-100'
                  }`}
                >
                  <span>
                    <p className={`font-semibold ${goal === g.id ? '' : 'text-ink-800'}`}>{g.label}</p>
                    <p className="text-xs text-ink-600 mt-0.5">{g.blurb}</p>
                  </span>
                  {goal === g.id && <Check size={18} className="shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </StepWrap>
        )}

        <div className="mt-auto pt-6 flex items-center gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button className="flex-1" accentClass={a.solidBtn} disabled={!canContinue} onClick={next}>
            {step === STEPS.length - 1 ? 'See My Plan' : 'Continue'}
          </Button>
        </div>
      </div>
    </PhoneShell>
  )
}

function StepWrap({ title, subtitle, children }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-ink-950 leading-tight">{title}</h2>
      <p className="text-ink-600 text-sm mt-2">{subtitle}</p>
      {children}
    </div>
  )
}

function RoundIconButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 rounded-full bg-cream-200 text-ink-800 flex items-center justify-center active:scale-95 transition"
    >
      {children}
    </button>
  )
}

function Slider({ min, max, value, onChange, accentHex, className = '' }) {
  return (
    <div className={className}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: accentHex }}
        className="w-full h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-ink-400 mt-1.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
