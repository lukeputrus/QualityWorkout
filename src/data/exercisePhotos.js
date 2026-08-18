// Real exercise photos for all 54 exercises. Most (48) are from
// free-exercise-db (github.com/yuhonas/free-exercise-db), a public-domain
// (Unlicense) dataset — no copyright/licensing risk, no attribution needed.
// Each has 2 photos (start/end position); ExercisePhoto.jsx crossfades
// between them on a loop to simulate a GIF. The remaining 6 (Burpees, Curtsy
// Lunge, Foam Rolling, Full Body Stretch, Incline Walk Intervals, Light
// Walk) aren't in that dataset at all, so they come from Wikimedia Commons
// instead — see WIKIMEDIA below and PHOTO_CREDITS for their (mostly
// Creative Commons) attribution. All hotlinked from their respective CDNs
// rather than downloaded into this repo, so this has a live external
// dependency unlike most of this app — every URL here was verified to
// resolve (HTTP 200) before being added, and ExercisePhoto.jsx falls back
// to the illustrated animation if a load ever fails or hangs.
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

// A handful of exercises (Burpees, Curtsy Lunge, Foam Rolling, Full Body
// Stretch, Incline Walk Intervals, Light Walk) aren't in free-exercise-db at
// all — no "burpee" or "foam" entries exist in that dataset. These come from
// Wikimedia Commons instead, full URLs since they're not under BASE. Unlike
// the free-exercise-db set, most of these are Creative Commons licensed
// (not public domain) and require attribution — see PHOTO_CREDITS below and
// the credits list surfaced in the Profile screen.
const WIKIMEDIA = {
  Burpees: [
    'https://upload.wikimedia.org/wikipedia/commons/c/c5/Burpee_2_Squat.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f5/Burpee_5_Thrust.jpg',
  ],
  'Curtsy Lunge': [
    'https://upload.wikimedia.org/wikipedia/commons/2/2f/U.S._Navy_Logistics_Specialist_3rd_Class_Andrew_Lee_performs_lunges_during_command_physical_training_in_the_hangar_bay_aboard_the_aircraft_carrier_USS_Nimitz_%28CVN_68%29_in_the_Pacific_Ocean_April_8%2C_2013_130408-N-TW634-226.jpg',
  ],
  'Foam Rolling': [
    'https://upload.wikimedia.org/wikipedia/commons/f/f8/Foam_rolling_on_back.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9c/Calf_foam_rolling.jpg',
  ],
  'Full Body Stretch': [
    'https://upload.wikimedia.org/wikipedia/commons/8/8a/Stretching_%287559234072%29.jpg',
  ],
  'Incline Walk Intervals': [
    'https://upload.wikimedia.org/wikipedia/commons/8/8f/A_woman_exercising_on_a_treadmill.jpg',
  ],
  'Light Walk': [
    'https://upload.wikimedia.org/wikipedia/commons/d/dd/Power_Walking.jpg',
  ],
}

export const EXERCISE_PHOTOS = {
  ...Object.fromEntries(Object.entries(PATHS).map(([name, paths]) => [name, paths.map((p) => BASE + p)])),
  ...WIKIMEDIA,
}

// Attribution for the Creative Commons licensed photos above (the
// free-exercise-db set is public domain / Unlicense and needs none). Shown
// in Profile so the CC BY / CC BY-SA "attribution required" terms are met.
export const PHOTO_CREDITS = [
  {
    exercise: 'Burpees',
    title: 'Burpee sequence photos',
    author: 'Taco fleur',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/Category:Burpee_(exercise)',
  },
  {
    exercise: 'Curtsy Lunge',
    title: 'U.S. Navy lunges photo',
    author: 'MCSN Derek A. Harkins / U.S. Navy',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/Category:Lunge_(exercise)',
  },
  {
    exercise: 'Foam Rolling',
    title: 'Foam rolling photos',
    author: 'PTPioneer; Tyler Read',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Foam_rolling_on_back.jpg',
  },
  {
    exercise: 'Full Body Stretch',
    title: 'Stretching photo',
    author: 'Timothy Krause',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Stretching_(7559234072).jpg',
  },
  {
    exercise: 'Incline Walk Intervals',
    title: 'Treadmill photo',
    author: 'Rwebogora',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:A_woman_exercising_on_a_treadmill.jpg',
  },
  {
    exercise: 'Light Walk',
    title: 'Power Walking photo',
    author: 'Powerwalkingclub',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Power_Walking.jpg',
  },
]
