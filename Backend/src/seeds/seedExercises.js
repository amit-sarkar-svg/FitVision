require('dotenv').config();

const connectDB = require('../config/db');
const Exercise = require('../models/Exercise');

const dumbbellBenchPress = {
  id: 'dumbbell-bench-press',
  name: 'Dumbbell Bench Press',
  cover: '/images/exercises/dumbbell-bench-press-cover.png',
  category: 'Chest',
  difficulty: 'Intermediate',
  primaryMuscles: ['Pectoralis Major'],
  secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii'],
  description:
    'A compound exercise that primarily targets the chest muscles and also engages the shoulders and triceps.',
  benefits: [
    'Builds upper body strength',
    'Improves chest muscle definition',
    'Enhances shoulder stability',
  ],
  commonMistakes: [
    'Flaring elbows too wide',
    'Bouncing weights off chest',
    'Arching back excessively',
  ],
  instructions: [
    'Lie flat on a bench with a dumbbell in each hand',
    'Press the weights up until arms are extended',
    'Lower with control to chest level',
    'Repeat for desired reps',
  ],
  tips: 'Keep your shoulder blades retracted and your feet flat on the ground.',
  correctForm: [
    'Back flat on bench',
    'Feet flat on ground',
    'Dumbbells controlled',
    'Full range of motion',
  ],
  relatedExercises: [
    {
      id: 'incline-dumbbell-press',
      name: 'Incline Dumbbell Press',
      category: 'Chest',
    },
    {
      id: 'push-up',
      name: 'Push Up',
      category: 'Chest',
    },
    {
      id: 'cable-fly',
      name: 'Cable Fly',
      category: 'Chest',
    },
  ],
  video: null,
  model3D: null,
  audio: null,
  duration: 18,
};

const seedExercises = async () => {
  try {
    await connectDB();

    const exercise = await Exercise.findOneAndUpdate(
      { id: dumbbellBenchPress.id },
      { $set: dumbbellBenchPress },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log(`Seeded exercise: ${exercise.name} (${exercise._id})`);
  } catch (error) {
    console.error('Exercise seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await Exercise.db.close();
  }
};

seedExercises();
