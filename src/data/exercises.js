export const exercises = [
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    cover: "/images/exercises/dumbbell-bench-press-cover.png",
    category: "Chest",
    difficulty: "Intermediate",
    primaryMuscles: ["Pectoralis Major"],
    secondaryMuscles: ["Anterior Deltoid", "Triceps Brachii"],
    description:
      "A compound exercise that primarily targets the chest muscles and also engages the shoulders and triceps.",
    benefits: [
      "Builds upper body strength",
      "Improves chest muscle definition",
      "Enhances shoulder stability",
    ],
    commonMistakes: [
      "Flaring elbows too wide",
      "Bouncing weights off chest",
      "Arching back excessively",
    ],
    instructions: [
      "Lie flat on a bench with a dumbbell in each hand",
      "Press the weights up until arms are extended",
      "Lower with control to chest level",
      "Repeat for desired reps",
    ],
    tips: "Keep your shoulder blades retracted and your feet flat on the ground.",
    correctForm: [
      "Back flat on bench",
      "Feet flat on ground",
      "Dumbbells controlled",
      "Full range of motion",
    ],
    relatedExercises: [
      {
        id: "incline-dumbbell-press",
        name: "Incline Dumbbell Press",
        category: "Chest",
      },
      {
        id: "push-up",
        name: "Push Up",
        category: "Chest",
      },
      {
        id: "cable-fly",
        name: "Cable Fly",
        category: "Chest",
      },
    ],
    video: null,
    model3D: null,
    audio: null,
    duration: 18,
  },
];

export const muscleLabels = {
  "Pectoralis Major": { label: "Pectoralis Major (Chest)", type: "primary" },
  "Anterior Deltoid": {
    label: "Anterior Deltoid (Shoulders)",
    type: "secondary",
  },
  "Triceps Brachii": { label: "Triceps Brachii (Arms)", type: "secondary" },
};

export function getExerciseById(id) {
  if (!id) return undefined;
  const direct = exercises.find((exercise) => exercise.id === id);
  if (direct) return direct;

  // Search within related exercises as well
  for (const ex of exercises) {
    if (ex.relatedExercises) {
      const rel = ex.relatedExercises.find((r) => r.id === id);
      if (rel) {
        return {
          id: rel.id,
          name: rel.name,
          category: rel.category || "Chest",
          difficulty: "Intermediate",
          cover: `/images/exercises/${rel.id}-cover.png`,
          primaryMuscles: ["Pectoralis Major"],
          secondaryMuscles: ["Anterior Deltoid", "Triceps Brachii"],
          description: `A targeted ${rel.name} exercise focused on the chest muscles.`,
          instructions: [
            "Position yourself correctly with appropriate resistance",
            "Engage core and maintain controlled form",
            "Perform movement through full range of motion",
            "Repeat for desired reps",
          ],
          tips: "Maintain controlled form throughout the movement.",
          duration: 18,
        };
      }
    }
  }

  return undefined;
}

export const modelOptions = {
  male: [
    {
      id: "male-fitness",
      label: "Male fitness model",
      gender: "male",
      type: "fitness",
    },
    {
      id: "male-anatomy",
      label: "Male anatomy",
      gender: "male",
      type: "anatomy",
    },
  ],
  female: [
    {
      id: "female-fitness",
      label: "Female fitness model",
      gender: "female",
      type: "fitness",
    },
    {
      id: "female-anatomy",
      label: "Female anatomy",
      gender: "female",
      type: "anatomy",
    },
  ],
};
