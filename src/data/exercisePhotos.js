// Real exercise photos from free-exercise-db (github.com/yuhonas/free-exercise-db),
// a public-domain (Unlicense) dataset — no copyright/licensing risk. Each
// exercise has 2 photos (start/end position); ExercisePhoto.jsx crossfades
// between them on a loop to simulate a GIF. Hotlinked from GitHub's raw
// content CDN rather than downloaded into this repo, so it depends on that
// repo staying up — a reasonable bet given it's a stable, widely-used open
// dataset, but worth knowing. Every URL here was verified to resolve
// (HTTP 200) before being added. Exercises not listed fall back to the
// illustrated animation in ExerciseAnimation.jsx.
const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const PATHS = {
  'Back Squat': ['Barbell_Squat/0.jpg', 'Barbell_Squat/1.jpg'],
  'Barbell Bench Press': ['Barbell_Bench_Press_-_Medium_Grip/0.jpg', 'Barbell_Bench_Press_-_Medium_Grip/1.jpg'],
  'Barbell Curl': ['Barbell_Curl/0.jpg', 'Barbell_Curl/1.jpg'],
  'Barbell Hip Thrust': ['Barbell_Hip_Thrust/0.jpg', 'Barbell_Hip_Thrust/1.jpg'],
  'Barbell Row': ['Bent_Over_Barbell_Row/0.jpg', 'Bent_Over_Barbell_Row/1.jpg'],
  'Barbell Shrugs': ['Barbell_Shrug/0.jpg', 'Barbell_Shrug/1.jpg'],
  'Bicycle Crunch': ['Air_Bike/0.jpg', 'Air_Bike/1.jpg'],
  'Bulgarian Split Squat': ['Split_Squats/0.jpg', 'Split_Squats/1.jpg'],
  'Cable Crunch': ['Cable_Crunch/0.jpg', 'Cable_Crunch/1.jpg'],
  'Cable Fly': ['Flat_Bench_Cable_Flyes/0.jpg', 'Flat_Bench_Cable_Flyes/1.jpg'],
  'Cable Glute Kickback': ['One-Legged_Cable_Kickback/0.jpg', 'One-Legged_Cable_Kickback/1.jpg'],
  'Cable Pushdown': ['Triceps_Pushdown/0.jpg', 'Triceps_Pushdown/1.jpg'],
  'Close-Grip Bench Press': ['Close-Grip_Barbell_Bench_Press/0.jpg', 'Close-Grip_Barbell_Bench_Press/1.jpg'],
  'Dead Bug': ['Dead_Bug/0.jpg', 'Dead_Bug/1.jpg'],
  'Dumbbell Chest Fly': ['Dumbbell_Flyes/0.jpg', 'Dumbbell_Flyes/1.jpg'],
  'Dumbbell Curl': ['Dumbbell_Bicep_Curl/0.jpg', 'Dumbbell_Bicep_Curl/1.jpg'],
  'Dumbbell Shoulder Press': ['Dumbbell_Shoulder_Press/0.jpg', 'Dumbbell_Shoulder_Press/1.jpg'],
  'EZ-Bar Curl': ['EZ-Bar_Curl/0.jpg', 'EZ-Bar_Curl/1.jpg'],
  'Face Pull': ['Face_Pull/0.jpg', 'Face_Pull/1.jpg'],
  'Glute Bridge March': ['Single_Leg_Glute_Bridge/0.jpg', 'Single_Leg_Glute_Bridge/1.jpg'],
  'Goblet Squat': ['Goblet_Squat/0.jpg', 'Goblet_Squat/1.jpg'],
  'Hammer Curl': ['Alternate_Hammer_Curl/0.jpg', 'Alternate_Hammer_Curl/1.jpg'],
  'Hanging Leg Raise': ['Hanging_Leg_Raise/0.jpg', 'Hanging_Leg_Raise/1.jpg'],
  'Incline Dumbbell Press': ['Incline_Dumbbell_Press/0.jpg', 'Incline_Dumbbell_Press/1.jpg'],
  'Jump Squats': ['Freehand_Jump_Squat/0.jpg', 'Freehand_Jump_Squat/1.jpg'],
  'Kettlebell Swings': ['One-Arm_Kettlebell_Swings/0.jpg', 'One-Arm_Kettlebell_Swings/1.jpg'],
  'Lat Pulldown': ['Wide-Grip_Lat_Pulldown/0.jpg', 'Wide-Grip_Lat_Pulldown/1.jpg'],
  'Lateral Raise': ['Side_Lateral_Raise/0.jpg', 'Side_Lateral_Raise/1.jpg'],
  'Leg Press': ['Leg_Press/0.jpg', 'Leg_Press/1.jpg'],
  'Leg Raises': ['Front_Leg_Raises/0.jpg', 'Front_Leg_Raises/1.jpg'],
  'Mountain Climbers': ['Mountain_Climbers/0.jpg', 'Mountain_Climbers/1.jpg'],
  'Overhead Press': ['Standing_Military_Press/0.jpg', 'Standing_Military_Press/1.jpg'],
  'Overhead Tricep Extension': ['Cable_Rope_Overhead_Triceps_Extension/0.jpg', 'Cable_Rope_Overhead_Triceps_Extension/1.jpg'],
  Plank: ['Plank/0.jpg', 'Plank/1.jpg'],
  'Pull-Ups': ['Wide-Grip_Rear_Pull-Up/0.jpg', 'Wide-Grip_Rear_Pull-Up/1.jpg'],
  'Push-Ups': ['Push-Up_Wide/0.jpg', 'Push-Up_Wide/1.jpg'],
  'Rear Delt Fly': ['Cable_Rear_Delt_Fly/0.jpg', 'Cable_Rear_Delt_Fly/1.jpg'],
  'Reverse Fly': ['Reverse_Flyes/0.jpg', 'Reverse_Flyes/1.jpg'],
  'Romanian Deadlift': ['Romanian_Deadlift/0.jpg', 'Romanian_Deadlift/1.jpg'],
  'Russian Twist': ['Russian_Twist/0.jpg', 'Russian_Twist/1.jpg'],
  'Seated Cable Row': ['Seated_Cable_Rows/0.jpg', 'Seated_Cable_Rows/1.jpg'],
  'Side Plank': ['Push_Up_to_Side_Plank/0.jpg', 'Push_Up_to_Side_Plank/1.jpg'],
  'Skull Crushers': ['EZ-Bar_Skullcrusher/0.jpg', 'EZ-Bar_Skullcrusher/1.jpg'],
  'Standing Calf Raise': ['Standing_Dumbbell_Calf_Raise/0.jpg', 'Standing_Dumbbell_Calf_Raise/1.jpg'],
  'Sumo Deadlift': ['Sumo_Deadlift/0.jpg', 'Sumo_Deadlift/1.jpg'],
  'Tricep Pushdown': ['Triceps_Pushdown_-_Rope_Attachment/0.jpg', 'Triceps_Pushdown_-_Rope_Attachment/1.jpg'],
  'Walking Lunges': ['Bodyweight_Walking_Lunge/0.jpg', 'Bodyweight_Walking_Lunge/1.jpg'],
  'Weighted Dips': ['Dips_-_Triceps_Version/0.jpg', 'Dips_-_Triceps_Version/1.jpg'],
}

export const EXERCISE_PHOTOS = Object.fromEntries(
  Object.entries(PATHS).map(([name, paths]) => [name, paths.map((p) => BASE + p)]),
)
