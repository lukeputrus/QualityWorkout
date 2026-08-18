// Which animated movement pattern to show for each exercise. Replaces the
// old YouTube embed entirely — no external video, no ads, no availability
// risk. Each pattern id has a matching CSS animation in index.css and a
// human-readable label below.
export const EXERCISE_PATTERNS = {
  'Back Squat': 'squat',
  'Goblet Squat': 'squat',
  'Leg Press': 'squat',

  'Bulgarian Split Squat': 'lunge',
  'Walking Lunges': 'lunge',
  'Curtsy Lunge': 'lunge',

  'Barbell Hip Thrust': 'hinge',
  'Romanian Deadlift': 'hinge',
  'Sumo Deadlift': 'hinge',
  'Kettlebell Swings': 'hinge',
  'Glute Bridge March': 'hinge',
  'Cable Glute Kickback': 'hinge',

  'Barbell Bench Press': 'push-horizontal',
  'Incline Dumbbell Press': 'push-horizontal',
  'Close-Grip Bench Press': 'push-horizontal',
  'Push-Ups': 'push-horizontal',
  'Weighted Dips': 'push-horizontal',
  'Dumbbell Chest Fly': 'push-horizontal',
  'Cable Fly': 'push-horizontal',

  'Overhead Press': 'push-overhead',
  'Dumbbell Shoulder Press': 'push-overhead',

  'Pull-Ups': 'pull-vertical',
  'Lat Pulldown': 'pull-vertical',

  'Barbell Row': 'pull-horizontal',
  'Seated Cable Row': 'pull-horizontal',
  'Face Pull': 'pull-horizontal',
  'Reverse Fly': 'pull-horizontal',
  'Rear Delt Fly': 'pull-horizontal',

  'Barbell Curl': 'curl',
  'Dumbbell Curl': 'curl',
  'EZ-Bar Curl': 'curl',
  'Hammer Curl': 'curl',

  'Skull Crushers': 'extension',
  'Overhead Tricep Extension': 'extension',
  'Cable Pushdown': 'extension',
  'Tricep Pushdown': 'extension',

  'Lateral Raise': 'raise',
  'Barbell Shrugs': 'raise',

  'Cable Crunch': 'core',
  'Bicycle Crunch': 'core',
  'Hanging Leg Raise': 'core',
  'Leg Raises': 'core',
  'Russian Twist': 'core',
  'Dead Bug': 'core',

  Plank: 'isometric',
  'Side Plank': 'isometric',

  Burpees: 'cardio',
  'Mountain Climbers': 'cardio',
  'Jump Squats': 'cardio',

  'Standing Calf Raise': 'calf',

  'Foam Rolling': 'stretch',
  'Full Body Stretch': 'stretch',
  'Light Walk': 'stretch',
  'Incline Walk Intervals': 'stretch',
}

// Which equipment illustration to draw for each pattern (ExerciseAnimation.jsx)
export const EQUIPMENT_FOR_PATTERN = {
  squat: 'barbell',
  lunge: 'bodyweight',
  hinge: 'barbell',
  'push-horizontal': 'bench',
  'push-overhead': 'barbell',
  'pull-vertical': 'cable-high',
  'pull-horizontal': 'cable-low',
  curl: 'dumbbell',
  extension: 'cable-high',
  raise: 'dumbbell',
  core: 'bodyweight',
  isometric: 'bodyweight',
  cardio: 'bodyweight',
  calf: 'bodyweight',
  stretch: 'bodyweight',
}

export const PATTERN_LABELS = {
  squat: 'Squat pattern',
  lunge: 'Lunge pattern',
  hinge: 'Hip-hinge pattern',
  'push-horizontal': 'Horizontal push',
  'push-overhead': 'Overhead push',
  'pull-vertical': 'Vertical pull',
  'pull-horizontal': 'Horizontal pull',
  curl: 'Curl',
  extension: 'Extension',
  raise: 'Raise',
  core: 'Core flexion',
  isometric: 'Isometric hold',
  cardio: 'Dynamic / explosive',
  calf: 'Calf raise',
  stretch: 'Mobility & recovery',
}
