export const GOALS = [
  { id: 'lose-weight', label: 'Lose Weight', blurb: 'Burn fat with strength + conditioning' },
  { id: 'build-muscle', label: 'Build Muscle', blurb: 'Hypertrophy-focused progressive overload' },
  { id: 'tone-up', label: 'Tone Up', blurb: 'Lean, defined, higher-rep training' },
  { id: 'strength', label: 'Get Stronger', blurb: 'Heavier loads, lower reps, longer rest' },
  { id: 'general', label: 'General Fitness', blurb: 'Balanced, sustainable, feel-good training' },
]

// Exercise shape:
// { name, type: 'reps' | 'time', sets, reps?, seconds?, restSeconds, cue }
const male = [
  {
    id: 'chest',
    title: 'Chest Day',
    focus: 'Chest & Triceps',
    emoji: '🏋️',
    exercises: [
      { name: 'Barbell Bench Press', type: 'reps', sets: 4, reps: 8, restSeconds: 90, cue: 'Pin your shoulder blades back, control the descent.' },
      { name: 'Incline Dumbbell Press', type: 'reps', sets: 3, reps: 10, restSeconds: 75, cue: 'Press up and slightly in, squeeze at the top.' },
      { name: 'Cable Fly', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Slight bend in the elbow, lead with your chest.' },
      { name: 'Weighted Dips', type: 'reps', sets: 3, reps: 10, restSeconds: 75, cue: 'Lean forward to bias the chest, full stretch at the bottom.' },
      { name: 'Overhead Tricep Extension', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Keep elbows tucked and stationary.' },
    ],
  },
  {
    id: 'back',
    title: 'Back Day',
    focus: 'Back & Biceps',
    emoji: '🦾',
    exercises: [
      { name: 'Pull-Ups', type: 'reps', sets: 4, reps: 8, restSeconds: 90, cue: 'Drive elbows down, chest to the bar.' },
      { name: 'Barbell Row', type: 'reps', sets: 4, reps: 10, restSeconds: 75, cue: 'Flat back, pull to your lower ribs.' },
      { name: 'Lat Pulldown', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Lead with your elbows, avoid swinging.' },
      { name: 'Seated Cable Row', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Squeeze shoulder blades together at the finish.' },
      { name: 'Barbell Curl', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Elbows pinned to your sides, no swinging.' },
    ],
  },
  {
    id: 'legs',
    title: 'Leg Day',
    focus: 'Quads, Hamstrings & Glutes',
    emoji: '🦵',
    exercises: [
      { name: 'Back Squat', type: 'reps', sets: 4, reps: 8, restSeconds: 120, cue: 'Brace your core, knees track over toes.' },
      { name: 'Romanian Deadlift', type: 'reps', sets: 3, reps: 10, restSeconds: 90, cue: 'Hinge at the hips, feel the hamstring stretch.' },
      { name: 'Leg Press', type: 'reps', sets: 3, reps: 12, restSeconds: 75, cue: "Don't let your lower back round at the bottom." },
      { name: 'Walking Lunges', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Long stride, drive through the front heel.' },
      { name: 'Standing Calf Raise', type: 'reps', sets: 4, reps: 15, restSeconds: 45, cue: 'Full stretch at the bottom, pause at the top.' },
    ],
  },
  {
    id: 'shoulders',
    title: 'Shoulder Day',
    focus: 'Shoulders & Traps',
    emoji: '🏔️',
    exercises: [
      { name: 'Overhead Press', type: 'reps', sets: 4, reps: 8, restSeconds: 90, cue: 'Brace your core, press straight up.' },
      { name: 'Lateral Raise', type: 'reps', sets: 4, reps: 15, restSeconds: 45, cue: 'Lead with your elbows, stop at shoulder height.' },
      { name: 'Rear Delt Fly', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Hinge forward, squeeze shoulder blades.' },
      { name: 'Face Pull', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Pull to your forehead, rotate shoulders back.' },
      { name: 'Barbell Shrugs', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Straight up and down, no rolling.' },
    ],
  },
  {
    id: 'arms',
    title: 'Arms Day',
    focus: 'Biceps & Triceps',
    emoji: '💪',
    exercises: [
      { name: 'Close-Grip Bench Press', type: 'reps', sets: 4, reps: 10, restSeconds: 75, cue: 'Elbows tucked, bar to lower chest.' },
      { name: 'EZ-Bar Curl', type: 'reps', sets: 4, reps: 10, restSeconds: 60, cue: 'Full range, no momentum.' },
      { name: 'Skull Crushers', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Elbows fixed, lower to your forehead.' },
      { name: 'Hammer Curl', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Neutral grip, control the negative.' },
      { name: 'Cable Pushdown', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Elbows pinned, full lockout.' },
    ],
  },
  {
    id: 'core',
    title: 'Core & Cardio',
    focus: 'Abs & Conditioning',
    emoji: '🔥',
    exercises: [
      { name: 'Hanging Leg Raise', type: 'reps', sets: 4, reps: 12, restSeconds: 60, cue: 'Curl your pelvis, avoid swinging.' },
      { name: 'Cable Crunch', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Crunch from your ribs, not your hips.' },
      { name: 'Plank', type: 'time', sets: 3, seconds: 45, restSeconds: 30, cue: 'Squeeze glutes, keep hips level.' },
      { name: 'Russian Twist', type: 'reps', sets: 3, reps: 20, restSeconds: 45, cue: 'Rotate from your torso, feet up for more challenge.' },
      { name: 'Incline Walk Intervals', type: 'time', sets: 1, seconds: 900, restSeconds: 0, cue: 'Steady state, conversational pace.' },
    ],
  },
  {
    id: 'rest',
    title: 'Rest Day',
    focus: 'Recovery & Mobility',
    emoji: '🧘',
    exercises: [
      { name: 'Full Body Stretch', type: 'time', sets: 1, seconds: 600, restSeconds: 0, cue: 'Move slow, breathe into each stretch.' },
      { name: 'Foam Rolling', type: 'time', sets: 1, seconds: 600, restSeconds: 0, cue: 'Roll slowly over tight spots, 30-60s each.' },
      { name: 'Light Walk', type: 'time', sets: 1, seconds: 1200, restSeconds: 0, cue: 'Easy pace, let your body recover.' },
    ],
  },
]

const female = [
  {
    id: 'glutes-legs',
    title: 'Glutes & Legs',
    focus: 'Glute-Focused Lower Body',
    emoji: '🔥',
    exercises: [
      { name: 'Barbell Hip Thrust', type: 'reps', sets: 4, reps: 10, restSeconds: 90, cue: 'Drive through your heels, squeeze glutes hard at the top.' },
      { name: 'Goblet Squat', type: 'reps', sets: 3, reps: 12, restSeconds: 75, cue: 'Chest tall, knees tracking over toes.' },
      { name: 'Romanian Deadlift', type: 'reps', sets: 3, reps: 12, restSeconds: 75, cue: 'Hinge at the hips, feel the stretch in your hamstrings.' },
      { name: 'Cable Glute Kickback', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Squeeze at the top, avoid arching your back.' },
      { name: 'Walking Lunges', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Long stride, drive through the front heel.' },
    ],
  },
  {
    id: 'back-arms',
    title: 'Back & Arms',
    focus: 'Back, Biceps & Triceps',
    emoji: '🦾',
    exercises: [
      { name: 'Lat Pulldown', type: 'reps', sets: 4, reps: 12, restSeconds: 60, cue: 'Lead with your elbows, control the negative.' },
      { name: 'Seated Cable Row', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Squeeze shoulder blades together at the finish.' },
      { name: 'Dumbbell Curl', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Elbows pinned to your sides.' },
      { name: 'Tricep Pushdown', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Elbows fixed, full lockout at the bottom.' },
      { name: 'Reverse Fly', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Hinge forward, squeeze shoulder blades together.' },
    ],
  },
  {
    id: 'hiit',
    title: 'Full Body HIIT',
    focus: 'Conditioning & Total Body',
    emoji: '⚡',
    exercises: [
      { name: 'Kettlebell Swings', type: 'reps', sets: 4, reps: 15, restSeconds: 45, cue: 'Hinge and snap your hips, arms stay relaxed.' },
      { name: 'Jump Squats', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Land soft, chest up.' },
      { name: 'Mountain Climbers', type: 'time', sets: 3, seconds: 30, restSeconds: 30, cue: 'Keep your hips low and core braced.' },
      { name: 'Push-Ups', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Straight line from head to heels.' },
      { name: 'Burpees', type: 'reps', sets: 3, reps: 10, restSeconds: 60, cue: 'Move with control, land soft.' },
    ],
  },
  {
    id: 'core',
    title: 'Core & Abs',
    focus: 'Deep Core & Obliques',
    emoji: '✨',
    exercises: [
      { name: 'Plank', type: 'time', sets: 3, seconds: 45, restSeconds: 30, cue: 'Squeeze glutes, keep hips level.' },
      { name: 'Bicycle Crunch', type: 'reps', sets: 3, reps: 20, restSeconds: 45, cue: 'Slow and controlled, elbow to opposite knee.' },
      { name: 'Side Plank', type: 'time', sets: 3, seconds: 30, restSeconds: 30, cue: 'Stack your hips, keep your body in one line.' },
      { name: 'Dead Bug', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Press your lower back into the floor.' },
      { name: 'Leg Raises', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Keep your lower back flat on the mat.' },
    ],
  },
  {
    id: 'upper',
    title: 'Upper Body Tone',
    focus: 'Shoulders & Chest',
    emoji: '🌟',
    exercises: [
      { name: 'Dumbbell Shoulder Press', type: 'reps', sets: 3, reps: 12, restSeconds: 60, cue: 'Press straight up, avoid arching your back.' },
      { name: 'Lateral Raise', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Lead with your elbows, stop at shoulder height.' },
      { name: 'Push-Ups', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Modify on your knees if needed, keep your core tight.' },
      { name: 'Dumbbell Chest Fly', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Slight bend in the elbow, control the stretch.' },
      { name: 'Face Pull', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Pull to your forehead, rotate shoulders back.' },
    ],
  },
  {
    id: 'glutes-legs-2',
    title: 'Glutes & Legs II',
    focus: 'Glute Activation & Hamstrings',
    emoji: '🔥',
    exercises: [
      { name: 'Sumo Deadlift', type: 'reps', sets: 4, reps: 10, restSeconds: 90, cue: 'Wide stance, chest tall, push the floor away.' },
      { name: 'Bulgarian Split Squat', type: 'reps', sets: 3, reps: 10, restSeconds: 75, cue: 'Back foot elevated, front knee tracks over toes.' },
      { name: 'Glute Bridge March', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Keep hips level as you lift each foot.' },
      { name: 'Curtsy Lunge', type: 'reps', sets: 3, reps: 12, restSeconds: 45, cue: 'Step back and across, keep your chest tall.' },
      { name: 'Standing Calf Raise', type: 'reps', sets: 3, reps: 15, restSeconds: 45, cue: 'Full stretch at the bottom, pause at the top.' },
    ],
  },
  {
    id: 'rest',
    title: 'Rest Day',
    focus: 'Recovery & Mobility',
    emoji: '🧘',
    exercises: [
      { name: 'Full Body Stretch', type: 'time', sets: 1, seconds: 600, restSeconds: 0, cue: 'Move slow, breathe into each stretch.' },
      { name: 'Foam Rolling', type: 'time', sets: 1, seconds: 600, restSeconds: 0, cue: 'Roll slowly over tight spots, 30-60s each.' },
      { name: 'Light Walk', type: 'time', sets: 1, seconds: 1200, restSeconds: 0, cue: 'Easy pace, let your body recover.' },
    ],
  },
]

export const PROGRAMS = { male, female }

export function getProgram(gender) {
  return PROGRAMS[gender] || PROGRAMS.male
}

export function getDay(gender, dayId) {
  return getProgram(gender).find((d) => d.id === dayId)
}
