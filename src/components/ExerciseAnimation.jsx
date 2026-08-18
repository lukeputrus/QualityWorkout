import { EXERCISE_PATTERNS, EQUIPMENT_FOR_PATTERN } from '../data/movementPatterns.js'

// Self-contained illustrated demonstration — real equipment shapes (cable
// machine, barbell, bench, dumbbell) plus an articulated figure, animated on
// a loop via CSS. No video, no network request, no ads, never unavailable.

const EQ = '#14171b' // dark ink for equipment silhouettes
const FIG = '#ffffff' // white for the figure, for contrast against the accent bg

function Plates({ x, y }) {
  return (
    <>
      <circle cx={x} cy={y} r={13} fill={EQ} />
      <circle cx={x} cy={y} r={13} fill="none" stroke="#ffffff33" strokeWidth={2} />
    </>
  )
}

function BarbellScene({ pattern }) {
  if (pattern === 'squat') {
    return (
      <g className="fig-body-group">
        <rect x={64} y={56} width={92} height={7} rx={3.5} fill={EQ} />
        <Plates x={64} y={59.5} />
        <Plates x={156} y={59.5} />
        <rect x={98} y={55} width={24} height={42} rx={10} fill={FIG} />
        <circle cx={110} cy={42} r={11} fill={FIG} />
        <rect x={92} y={95} width={10} height={40} rx={5} fill={FIG} />
        <rect x={118} y={95} width={10} height={40} rx={5} fill={FIG} />
      </g>
    )
  }
  if (pattern === 'hinge') {
    return (
      <>
        <rect x={92} y={95} width={10} height={42} rx={5} fill={FIG} opacity={0.9} />
        <rect x={118} y={95} width={10} height={42} rx={5} fill={FIG} opacity={0.9} />
        <g className="fig-body-group">
          <rect x={98} y={55} width={24} height={40} rx={10} fill={FIG} />
          <circle cx={110} cy={42} r={11} fill={FIG} />
          <rect x={94} y={78} width={8} height={30} rx={4} fill={FIG} />
          <rect x={118} y={78} width={8} height={30} rx={4} fill={FIG} />
          <rect x={78} y={100} width={64} height={7} rx={3.5} fill={EQ} />
          <Plates x={78} y={103.5} />
          <Plates x={142} y={103.5} />
        </g>
      </>
    )
  }
  // push-overhead
  return (
    <g>
      <rect x={98} y={58} width={24} height={45} rx={10} fill={FIG} />
      <circle cx={110} cy={45} r={11} fill={FIG} />
      <rect x={92} y={100} width={10} height={38} rx={5} fill={FIG} />
      <rect x={118} y={100} width={10} height={38} rx={5} fill={FIG} />
      <g className="fig-arm-group" style={{ transformOrigin: '110px 65px' }}>
        <rect x={80} y={60} width={60} height={7} rx={3.5} fill={EQ} />
        <Plates x={80} y={63.5} />
        <Plates x={140} y={63.5} />
        <rect x={96} y={58} width={8} height={16} rx={4} fill={FIG} />
        <rect x={116} y={58} width={8} height={16} rx={4} fill={FIG} />
      </g>
    </g>
  )
}

function BenchScene() {
  return (
    <g>
      <rect x={50} y={112} width={115} height={12} rx={4} fill={EQ} />
      <rect x={58} y={124} width={8} height={16} fill={EQ} />
      <rect x={148} y={124} width={8} height={16} fill={EQ} />

      <circle cx={62} cy={100} r={10} fill={FIG} />
      <rect x={72} y={92} width={40} height={20} rx={10} fill={FIG} />
      <rect x={113} y={96} width={9} height={26} rx={4.5} fill={FIG} opacity={0.9} transform="rotate(55 113 96)" />
      <rect x={128} y={112} width={9} height={22} rx={4.5} fill={FIG} opacity={0.9} transform="rotate(100 128 112)" />

      <g className="fig-arm-group" style={{ transformOrigin: '92px 92px' }}>
        <rect x={84} y={72} width={8} height={20} rx={4} fill={FIG} />
        <rect x={64} y={64} width={64} height={7} rx={3.5} fill={EQ} />
        <Plates x={64} y={67.5} />
        <Plates x={128} y={67.5} />
      </g>
    </g>
  )
}

function CableScene({ low }) {
  const pulleyY = low ? 128 : 22
  const cableX = 168
  return (
    <g>
      {/* tower + weight stack */}
      <rect x={162} y={14} width={9} height={118} rx={3} fill={EQ} />
      <circle cx={cableX} cy={pulleyY} r={6} fill={EQ} />
      <rect x={154} y={34} width={22} height={6} rx={1.5} fill={EQ} opacity={0.55} />
      <rect x={154} y={44} width={22} height={6} rx={1.5} fill={EQ} opacity={0.7} />
      <rect x={154} y={54} width={22} height={6} rx={1.5} fill={EQ} opacity={0.85} />
      <rect className="fig-plate" x={154} y={64} width={22} height={6} rx={1.5} fill={EQ} />

      {/* short fixed cable stub anchored at the pulley — kept outside the
          animated group so it doesn't visually detach from the pulley */}
      <line x1={cableX} y1={pulleyY} x2={cableX} y2={pulleyY + (low ? -16 : 16)} stroke={EQ} strokeWidth={2} />

      {/* seat */}
      <rect x={64} y={122} width={30} height={10} rx={3} fill={EQ} />
      <rect x={68} y={106} width={8} height={20} rx={3} fill={EQ} />

      {/* figure (seated) */}
      <circle cx={79} cy={70} r={10} fill={FIG} />
      <rect x={70} y={80} width={20} height={34} rx={9} fill={FIG} />
      <rect x={68} y={110} width={9} height={22} rx={4.5} fill={FIG} opacity={0.9} />
      <rect x={82} y={110} width={9} height={22} rx={4.5} fill={FIG} opacity={0.9} />

      {/* handle + arms, animated as one group, gripped right by the body */}
      <g className="fig-cable-group">
        <rect x={82} y={82} width={9} height={20} rx={4.5} fill={FIG} />
        <rect x={112} y={82} width={9} height={20} rx={4.5} fill={FIG} />
        <rect className="fig-handle" x={86} y={86} width={40} height={6} rx={3} fill={EQ} />
      </g>
    </g>
  )
}

function DumbbellScene({ pattern }) {
  const raise = pattern === 'raise'
  return (
    <g>
      <circle cx={110} cy={42} r={11} fill={FIG} />
      <rect x={98} y={55} width={24} height={45} rx={10} fill={FIG} />
      <rect x={92} y={100} width={10} height={38} rx={5} fill={FIG} />
      <rect x={118} y={100} width={10} height={38} rx={5} fill={FIG} />
      <g
        className={raise ? 'fig-arm-raise' : 'fig-arm-curl'}
        style={{ transformOrigin: raise ? '108px 60px' : '108px 62px' }}
      >
        <rect x={100} y={60} width={8} height={30} rx={4} fill={FIG} />
        <rect x={94} y={92} width={20} height={7} rx={3.5} fill={EQ} />
        <circle cx={94} cy={95.5} r={7} fill={EQ} />
        <circle cx={114} cy={95.5} r={7} fill={EQ} />
      </g>
    </g>
  )
}

function BodyweightScene({ pattern }) {
  if (pattern === 'isometric') {
    return (
      <g className="fig-body-group" style={{ transformOrigin: '110px 100px' }}>
        <rect x={60} y={96} width={100} height={14} rx={7} fill={FIG} />
        <circle cx={54} cy={103} r={10} fill={FIG} />
        <rect x={150} y={110} width={9} height={22} rx={4.5} fill={FIG} transform="rotate(20 150 110)" />
        <rect x={62} y={110} width={9} height={22} rx={4.5} fill={FIG} transform="rotate(-20 62 110)" />
      </g>
    )
  }
  return (
    <g className="fig-body-group">
      <circle cx={110} cy={35} r={11} fill={FIG} />
      <rect x={98} y={48} width={24} height={40} rx={10} fill={FIG} />
      <g className="fig-legs-left" style={{ transformOrigin: '105px 88px' }}>
        <rect x={100} y={88} width={10} height={45} rx={5} fill={FIG} opacity={0.85} />
      </g>
      <g className="fig-legs-right" style={{ transformOrigin: '115px 88px' }}>
        <rect x={110} y={88} width={10} height={45} rx={5} fill={FIG} />
      </g>
      <rect x={80} y={55} width={9} height={26} rx={4.5} fill={FIG} opacity={0.85} />
      <rect x={131} y={55} width={9} height={26} rx={4.5} fill={FIG} opacity={0.85} />
    </g>
  )
}

export default function ExerciseAnimation({ exerciseName, setsLabel, accentGrad }) {
  const pattern = EXERCISE_PATTERNS[exerciseName] || 'stretch'
  const equipment = EQUIPMENT_FOR_PATTERN[pattern] || 'bodyweight'

  return (
    <div className={`anim-${pattern} equip-${equipment} relative w-full aspect-video rounded-3xl overflow-hidden bg-gradient-to-br ${accentGrad}`}>
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        {setsLabel && (
          <p
            className="text-white font-black text-4xl leading-none"
            style={{ textShadow: '0 2px 0 rgba(0,0,0,0.18)' }}
          >
            {setsLabel}
          </p>
        )}
        <p className="text-ink-950/75 font-extrabold text-xs tracking-wide uppercase mt-1.5 max-w-[75%]">
          {exerciseName}
        </p>
      </div>

      <svg viewBox="0 0 220 150" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax meet">
        {equipment === 'barbell' && <BarbellScene pattern={pattern} />}
        {equipment === 'bench' && <BenchScene />}
        {equipment === 'cable-high' && <CableScene low={false} />}
        {equipment === 'cable-low' && <CableScene low />}
        {equipment === 'dumbbell' && <DumbbellScene pattern={pattern} />}
        {equipment === 'bodyweight' && <BodyweightScene pattern={pattern} />}
      </svg>
    </div>
  )
}
