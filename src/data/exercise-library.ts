/**
 * Library copy for every exercise and drill in the plan. Practical coaching notes only;
 * nothing here is medical advice or a guarantee of outcome.
 */
export interface LibraryContent {
  purpose: string
  setup: string
  /** 2–4 short technique cues. */
  cues: string[]
  mistakes: string[]
}

export const EXERCISE_LIBRARY: Record<string, LibraryContent> = {
  // LEG
  'low-pogo-hops': {
    purpose:
      'Small, springy hops that build ankle stiffness and elastic calf strength for running.',
    setup: 'Stand tall, feet hip-width, knees soft, arms relaxed at your sides.',
    cues: [
      'Bounce off the balls of the feet',
      'Keep hops low and quick, heels just off the floor',
      'Land quietly and stay stacked over the feet',
    ],
    mistakes: [
      'Jumping high instead of quick',
      'Sinking into the heels or bending the knees a lot',
      'Continuing when contacts get loud or sloppy',
    ],
  },
  'back-squat': {
    purpose: 'Main bilateral lower-body strength lift for quads, glutes and adductors.',
    setup:
      'Bar on the upper back, hands just outside the shoulders, feet about shoulder-width with toes slightly out.',
    cues: [
      'Brace before each rep',
      'Knees track over the toes',
      'Sit down between the hips to a depth you control',
      'Drive up with the chest and hips together',
    ],
    mistakes: [
      'Losing the brace at the bottom',
      'Knees collapsing inward',
      'Grinding reps past the prescribed RIR',
    ],
  },
  'romanian-deadlift': {
    purpose: 'Hip-hinge strength for hamstrings, glutes and the whole posterior chain.',
    setup: 'Stand with the bar at the hips, feet hip-width, soft knees, shoulders back.',
    cues: [
      'Push the hips back, not down',
      'Keep the bar close to the legs',
      'Stop when the hamstrings are loaded and the back stays neutral',
    ],
    mistakes: [
      'Rounding the lower back to reach lower',
      'Turning it into a squat',
      'Letting the bar drift away from the body',
    ],
  },
  'reverse-lunge-or-bss': {
    purpose:
      'Single-leg strength and control; the reverse lunge and Bulgarian split squat are interchangeable here.',
    setup: 'Hold dumbbells at your sides. For the split squat, rear foot laces-down on a bench.',
    cues: [
      'Most weight on the front foot',
      'Lower straight down under control',
      'Front knee follows the toes',
      'Log reps per side',
    ],
    mistakes: [
      'Short stance that loads the knee too far forward',
      'Pushing off the back leg',
      'Twisting the hips',
    ],
  },
  'seated-leg-curl': {
    purpose: 'Knee-flexion strength for the hamstrings, complementing the hip hinge.',
    setup: 'Knee joint in line with the machine axis, pad just above the heels, thigh pad snug.',
    cues: ['Curl through the full range', 'Pause briefly when fully bent', 'Lower slowly'],
    mistakes: ['Lifting the hips off the seat', 'Swinging the weight', 'Cutting the range short'],
  },
  'seated-calf-raise': {
    purpose: 'Bent-knee calf work that targets the soleus, which takes a lot of load in running.',
    setup: 'Pad on the lower thighs, balls of the feet on the platform edge.',
    cues: ['Lower into a full stretch', 'Rise high onto the big toe side', 'Pause at the top'],
    mistakes: ['Bouncing at the bottom', 'Rolling onto the little toes', 'Rushing the tempo'],
  },
  'adductor-machine': {
    purpose: 'Direct inner-thigh strength that supports skating, lunging and change of direction.',
    setup: 'Sit tall, pads on the inner knees, start in a range that feels comfortable.',
    cues: [
      'Squeeze the legs together smoothly',
      'Control the opening phase',
      'Keep the back against the pad',
    ],
    mistakes: ['Starting too wide', 'Letting the weight stack slam', 'Leaning forward to cheat'],
  },
  'side-plank': {
    purpose: 'Lateral trunk endurance and hip stability.',
    setup: 'Elbow under the shoulder, feet stacked or staggered, body in one straight line.',
    cues: [
      'Push the floor away with the forearm',
      'Lift the hips so the body stays straight',
      'Breathe steadily',
      'Log total hold time across sides',
    ],
    mistakes: ['Hips sagging or piking', 'Shoulder shrugging toward the ear', 'Holding the breath'],
  },

  // PUSH
  'barbell-bench-press': {
    purpose: 'Main measurable press for chest, front delts and triceps.',
    setup:
      'Eyes under the bar, shoulder blades pulled back and down, feet planted, grip just outside shoulder-width.',
    cues: [
      'Lower to the mid/lower chest',
      'Elbows about 45–70° from the body',
      'Press up and slightly back',
      'Keep the shoulder blades set',
    ],
    mistakes: [
      'Bouncing the bar off the chest',
      'Flaring the elbows to 90°',
      'Losing leg drive and upper-back tightness',
    ],
  },
  'low-incline-db-press': {
    purpose: 'Upper-chest emphasis with a free range of motion.',
    setup: 'Bench at 20–30°, dumbbells at chest level, shoulder blades set.',
    cues: [
      'Keep the incline low',
      'Lower until a good stretch across the chest',
      'Press up and slightly in',
    ],
    mistakes: [
      'Setting the bench too steep, turning it into a shoulder press',
      'Clanking the bells at the top',
      'Letting the shoulders roll forward',
    ],
  },
  'smith-shoulder-press': {
    purpose: 'Stable overhead pressing for the front delts and triceps.',
    setup: 'Seat under the bar path, back supported, grip slightly wider than the shoulders.',
    cues: [
      'Brace the trunk against the pad',
      'Lower to about chin level',
      'Press straight up without arching',
    ],
    mistakes: ['Excessive lower-back arch', 'Half reps', 'Bar path too far in front of the face'],
  },
  'pec-deck': {
    purpose: 'Chest isolation through horizontal adduction.',
    setup: 'Back supported, handles around mid/lower chest height, small fixed elbow bend.',
    cues: [
      'Keep the elbow angle fixed',
      'Bring the hands together in an arc',
      'Control the stretch on the way back',
    ],
    mistakes: [
      'Rolling the shoulders forward at the finish',
      'Turning it into a press',
      'Overstretching at the start',
    ],
  },
  'preacher-curl': {
    purpose: 'Stable supinated curl for the biceps with little room to cheat.',
    setup: 'Armpits snug to the pad, upper arms flat, underhand grip.',
    cues: [
      'Lower all the way under control',
      'Curl without lifting the elbows',
      'Squeeze briefly at the top',
    ],
    mistakes: [
      'Dropping fast into the bottom',
      'Shoulders rolling forward to lift',
      'Cutting the bottom range',
    ],
  },
  'db-hammer-curl': {
    purpose: 'Neutral-grip curl for the brachialis and brachioradialis.',
    setup: 'Stand tall, dumbbells at the sides, palms facing in.',
    cues: ['Elbows stay by the ribs', 'Curl with the thumbs up', 'Lower slowly'],
    mistakes: ['Swinging the torso', 'Elbows drifting forward', 'Rushing the lowering phase'],
  },

  // PULL
  'pull-up': {
    purpose: 'Vertical pulling strength for the lats and upper back; the main measurable pull.',
    setup: 'Hang from the bar, hands just outside shoulder-width, shoulders active.',
    cues: [
      'Start by pulling the shoulder blades down',
      'Drive the elbows toward the ribs',
      'Chin over the bar, then a full controlled hang',
      'Log total reps; blank load means bodyweight',
    ],
    mistakes: [
      'Kipping or swinging',
      'Half reps at the top or bottom',
      'Adding load before 4 × 10 is clean',
    ],
  },
  'chest-supported-row': {
    purpose: 'Horizontal pulling for the upper back without lower-back fatigue.',
    setup: 'Chest on the pad, arms long, feet braced.',
    cues: [
      'Keep the chest on the pad',
      'Pull the elbows back and slightly down',
      'Pause briefly with the shoulder blades squeezed',
    ],
    mistakes: ['Lifting the chest off the pad to heave', 'Shrugging', 'Short range'],
  },
  'one-arm-cable-lat-row': {
    purpose: 'Unilateral lat work with a long stretch.',
    setup: 'Cable at chest height or slightly above, single handle, staggered stance or kneeling.',
    cues: [
      'Reach forward into a lat stretch',
      'Pull the elbow toward the hip',
      'Keep the torso still',
      'Log reps per side',
    ],
    mistakes: [
      'Rotating the torso to move the weight',
      'Pulling with the biceps',
      'Rushing the stretch',
    ],
  },
  'reverse-pec-deck': {
    purpose: 'Rear-delt and upper-back isolation for shoulder balance.',
    setup: 'Face the pad, handles at shoulder height, arms long with a small elbow bend.',
    cues: ['Move the arms out in a wide arc', 'Keep the chest on the pad', 'Control the return'],
    mistakes: [
      'Squeezing the shoulder blades hard instead of moving the arms',
      'Shrugging',
      'Using momentum',
    ],
  },
  'cable-lateral-raise': {
    purpose: 'Middle-delt work with constant tension.',
    setup: 'Cable at the low pulley, handle in the far hand, stand side-on.',
    cues: ['Lead with the elbow', 'Raise to about shoulder height', 'Lower slowly'],
    mistakes: [
      'Shrugging the trap into the lift',
      'Swinging the body',
      'Going far above shoulder height',
    ],
  },
  'overhead-cable-triceps-extension': {
    purpose: 'Triceps work in a lengthened position for the long head.',
    setup: 'Face away from a cable with a rope, arms overhead, staggered stance.',
    cues: [
      'Keep the elbows pointing forward',
      'Let the hands travel behind the head for a stretch',
      'Extend fully',
    ],
    mistakes: ['Elbows flaring wide', 'Arching the lower back', 'Short range at the stretch'],
  },
  'cable-pushdown': {
    purpose: 'Additional triceps volume with a simple, stable movement.',
    setup: 'High cable, bar or rope, elbows at your sides.',
    cues: ['Pin the elbows to the ribs', 'Push down to full extension', 'Control the way up'],
    mistakes: [
      'Leaning over the bar',
      'Elbows drifting forward',
      'Letting the weight yank the arms up',
    ],
  },
  shrug: {
    purpose: 'Optional upper-trapezius work.',
    setup: 'Dumbbells at the sides or machine handles, stand tall.',
    cues: ['Lift the shoulders straight up', 'Pause at the top', 'Lower fully'],
    mistakes: [
      'Rolling the shoulders',
      'Bending the elbows',
      'Using too much weight for a tiny range',
    ],
  },

  // Warm-up drills
  'easy-cycling': {
    purpose: 'Raise temperature and heart rate gently before lifting.',
    setup: 'Bike with a comfortable seat height and light resistance.',
    cues: ['Keep it conversational', 'Smooth cadence', 'Build slightly over the last minute'],
    mistakes: ['Turning the warm-up into a workout'],
  },
  'easy-rowing': {
    purpose: 'General warm-up that also wakes up the upper back.',
    setup: 'Rower with feet strapped, low damper setting.',
    cues: ['Legs, then body, then arms', 'Relaxed grip', 'Easy, steady pace'],
    mistakes: ['Pulling mostly with the arms', 'Going too hard'],
  },
  'knee-to-wall-ankle-rocks': {
    purpose: 'Ankle dorsiflexion mobility for squats, lunges and running.',
    setup: 'Half-kneeling or standing facing a wall, front foot a short distance from it.',
    cues: [
      'Drive the knee toward the wall over the middle toes',
      'Keep the heel down',
      'Move rhythmically',
    ],
    mistakes: ['Heel lifting', 'Knee caving inward'],
  },
  'hip-90-90-transitions': {
    purpose: 'Hip rotation mobility in both directions.',
    setup: 'Sit with both knees bent to 90°, one leg in front, one to the side.',
    cues: ['Rotate the knees side to side', 'Sit tall', 'Use hands for support if needed'],
    mistakes: ['Forcing range with momentum', 'Slumping through the back'],
  },
  'adductor-rock-backs': {
    purpose: 'Open up the inner thighs and hips.',
    setup: 'On hands and knees with one leg straight out to the side.',
    cues: [
      'Rock the hips back toward the heel',
      'Keep the back long',
      'Stay in a comfortable stretch',
    ],
    mistakes: ['Rounding the back', 'Bouncing into the stretch'],
  },
  'reverse-lunge-with-reach': {
    purpose: 'Dynamic hip-flexor opening and lunge rehearsal.',
    setup: 'Stand tall with feet hip-width.',
    cues: ['Step back into a lunge', 'Reach both arms overhead', 'Return with control'],
    mistakes: ['Arching the lower back to reach', 'Rushing'],
  },
  'bodyweight-squat': {
    purpose: 'Rehearse the squat pattern before loading.',
    setup: 'Feet about shoulder-width, toes slightly out.',
    cues: ['Sit between the hips', 'Knees follow the toes', 'Stand tall at the top'],
    mistakes: ['Heels lifting', 'Knees collapsing inward'],
  },
  'thoracic-extensions': {
    purpose: 'Upper-back extension mobility before pressing.',
    setup: 'Upper back over a bench edge or foam roller, hands behind the head.',
    cues: ['Extend over the support', 'Keep the ribs down', 'Breathe out as you extend'],
    mistakes: ['Arching from the lower back instead of the upper back'],
  },
  'wall-slides': {
    purpose: 'Scapular upward rotation and overhead control.',
    setup: 'Back or forearms against a wall, arms in a W position.',
    cues: ['Slide the arms up while keeping contact', 'Keep the ribs down', 'Return slowly'],
    mistakes: ['Shrugging', 'Arching the back to get higher'],
  },
  'scapular-push-ups': {
    purpose: 'Activate the serratus anterior and practise scapular control.',
    setup: 'High plank, arms straight.',
    cues: [
      'Let the chest sink between the shoulder blades',
      'Push the floor away to spread them',
      'Arms stay straight',
    ],
    mistakes: ['Bending the elbows', 'Sagging hips'],
  },
  'band-external-rotations': {
    purpose: 'Warm up the rotator cuff before pressing.',
    setup: 'Elbow at your side bent to 90°, light band across the body.',
    cues: ['Rotate the forearm out', 'Keep the elbow tucked', 'Slow return'],
    mistakes: ['Elbow drifting away from the body', 'Too heavy a band'],
  },
  'cat-cow': {
    purpose: 'Gentle spinal flexion and extension to start moving.',
    setup: 'Hands under the shoulders, knees under the hips.',
    cues: [
      'Round the back slowly, then arch gently',
      'Move with the breath',
      'Stay within comfort',
    ],
    mistakes: ['Rushing', 'Forcing end range'],
  },
  'side-lying-thoracic-rotations': {
    purpose: 'Upper-back rotation before pulling.',
    setup: 'Lie on your side, knees bent and stacked, arms straight in front.',
    cues: [
      'Open the top arm across the body',
      'Keep the knees together',
      'Follow the hand with your eyes',
    ],
    mistakes: ['Knees lifting apart', 'Forcing the arm to the floor'],
  },
  'scapular-pull-ups': {
    purpose: 'Activate the lower traps and lats before pull-ups.',
    setup: 'Hang from the bar with straight arms.',
    cues: ['Pull the shoulder blades down', 'Arms stay straight', 'Lower with control'],
    mistakes: ['Bending the elbows', 'Swinging'],
  },
  'band-pull-aparts': {
    purpose: 'Warm up the rear delts and mid-back.',
    setup: 'Hold a light band at shoulder height, arms straight.',
    cues: ['Pull the band apart to the chest', 'Keep the shoulders down', 'Control the return'],
    mistakes: ['Shrugging', 'Arching the back'],
  },

  // Mobility and core
  'side-lying-open-books': {
    purpose: 'Thoracic rotation and chest opening.',
    setup: 'Lie on your side, knees bent to 90° and stacked, arms together in front.',
    cues: ['Open the top arm like a book', 'Keep the knees stacked', 'Breathe out as you rotate'],
    mistakes: ['Letting the knees follow the arm', 'Forcing the range'],
  },
  'kettlebell-halos': {
    purpose: 'Shoulder mobility and trunk control with a light load.',
    setup: 'Hold a light kettlebell upside-down by the horns at chest height.',
    cues: [
      'Circle it close around the head',
      'Keep the ribs down and glutes on',
      'Both directions',
    ],
    mistakes: ['Too heavy a bell', 'Arching the lower back'],
  },
  'kb-dead-bug-pullover': {
    purpose: 'Anti-extension core strength with an overhead reach.',
    setup: 'Lie on your back, knees over hips at 90°, kettlebell held above the chest.',
    cues: [
      'Press the lower back gently into the floor',
      'Lower the bell behind the head slowly',
      'Exhale as you return',
    ],
    mistakes: ['Lower back lifting off the floor', 'Moving too fast'],
  },
  'plank-kb-pass-through': {
    purpose: 'Anti-rotation core control in a plank.',
    setup: 'High plank with a light kettlebell beside one hand.',
    cues: [
      'Reach under the body and drag the bell across',
      'Keep the hips square',
      'Feet wider for more stability',
    ],
    mistakes: ['Hips rotating or piking', 'Rushing the reps'],
  },
  'half-kneeling-kb-woodchopper': {
    purpose: 'Rotational strength and control through the trunk and hips.',
    setup: 'Half-kneeling, kettlebell held with both hands at the outside hip.',
    cues: [
      'Move the bell diagonally up across the body',
      'Rotate through the upper back',
      'Keep the pelvis steady',
    ],
    mistakes: ['Twisting from the lower back', 'Losing balance on the knee'],
  },
  'seated-controlled-twist': {
    purpose: 'Oblique strength with a slow, controlled rotation.',
    setup: 'Sit tall, knees bent, heels down, light weight at the chest.',
    cues: ['Rotate the ribs, not just the arms', 'Stay tall', 'Slow tempo'],
    mistakes: ['Collapsing into a slouch', 'Fast, jerky twisting'],
  },
  'kb-around-the-world': {
    purpose: 'Trunk stability while a load moves around the body.',
    setup: 'Stand tall, kettlebell in one hand.',
    cues: ['Pass the bell around the waist hand to hand', 'Keep the hips still', 'Both directions'],
    mistakes: ['Swaying the hips', 'Dropping the bell during hand-offs'],
  },
  'suitcase-march': {
    purpose: 'Lateral trunk and hip stability under a one-sided load.',
    setup: 'Hold a kettlebell in one hand at your side.',
    cues: ['Stand tall without leaning', 'March slowly, knee to hip height', 'Switch sides'],
    mistakes: ['Leaning toward or away from the bell', 'Shrugging the loaded shoulder'],
  },
  'kb-oblique-drop': {
    purpose: 'Oblique strength through controlled side bending.',
    setup: 'Stand with a kettlebell in one hand at your side.',
    cues: [
      'Lower the bell down the side of the leg',
      'Return using the opposite side',
      'Keep the movement in one plane',
    ],
    mistakes: ['Leaning forward', 'Using too much weight'],
  },
  'controlled-lateral-rotation': {
    purpose: 'Rotational control for the obliques. Final technique still needs confirmation.',
    setup: 'Confirm the exact setup with your coach before loading it.',
    cues: [
      'Keep the load light',
      'Move slowly and within comfort',
      'Avoid forcing rotation through the lower back',
    ],
    mistakes: ['Loading it before the technique is confirmed', 'Forced lumbar rotation'],
  },

  // Static stretching
  'half-kneeling-hip-flexor-stretch': {
    purpose: 'Stretch the hip flexors that tighten with running and skating.',
    setup: 'Half-kneeling, back knee on a pad, front foot flat.',
    cues: [
      'Tuck the pelvis slightly',
      'Shift forward until the front of the back hip stretches',
      'Breathe slowly',
    ],
    mistakes: ['Arching the lower back', 'Lunging too deep instead of tucking'],
  },
  'straight-knee-calf-stretch': {
    purpose: 'Stretch the gastrocnemius (upper calf).',
    setup: 'Hands on a wall, back leg straight, heel down.',
    cues: ['Keep the back knee straight', 'Heel stays on the floor', 'Lean in gently'],
    mistakes: ['Heel lifting', 'Bouncing'],
  },
  'bent-knee-soleus-stretch': {
    purpose: 'Stretch the soleus (lower calf).',
    setup: 'Same as the calf stretch, but bend the back knee.',
    cues: ['Bend the back knee', 'Keep the heel down', 'Feel it low in the calf'],
    mistakes: ['Straightening the knee', 'Heel lifting'],
  },
  'adductor-rock-frog-stretch': {
    purpose: 'Longer hold for the inner thighs.',
    setup: 'On hands or forearms with knees wide, or one leg out to the side.',
    cues: ['Ease the hips back', 'Stay in a comfortable stretch', 'Breathe'],
    mistakes: ['Forcing the knees wider', 'Rounding the back'],
  },
  'supine-hamstring-stretch': {
    purpose: 'Stretch the hamstrings without loading the back.',
    setup: 'Lie on your back, strap or hands around one lifted leg.',
    cues: [
      'Keep the other leg long on the floor',
      'Lift until a mild stretch',
      'Relax the shoulders',
    ],
    mistakes: ['Pulling hard with the arms', 'Lifting the hips off the floor'],
  },
  'figure-four-glute-stretch': {
    purpose: 'Stretch the glutes and deep hip rotators.',
    setup: 'On your back, ankle crossed over the opposite knee.',
    cues: ['Pull the bottom thigh toward you', 'Keep the head down', 'Relax into it'],
    mistakes: ['Twisting the pelvis', 'Pushing into knee pain'],
  },
  'kneeling-lat-stretch': {
    purpose: 'Stretch the lats after pulling work.',
    setup: 'Kneel facing a bench, elbows on the bench, hands together.',
    cues: ['Sit the hips back', 'Let the chest sink', 'Keep the ribs down'],
    mistakes: ['Arching the lower back'],
  },
  'doorway-pec-stretch': {
    purpose: 'Stretch the chest and front shoulder after pressing.',
    setup: 'Forearm on a door frame, elbow around shoulder height.',
    cues: ['Step through gently', 'Keep the shoulder down and back', 'Stop at a mild stretch'],
    mistakes: ['Letting the shoulder roll forward', 'Stretching into pinching pain'],
  },
}
