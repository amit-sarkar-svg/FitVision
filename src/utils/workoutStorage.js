const STORAGE_KEY = 'fitvision_workout_plans'

const DEFAULT_PLANS = [
  {
    id: 'plan_chest_focus',
    name: 'Chest Workout',
    description: 'Chest focused hypertrophy and strength routine',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 'dumbbell-bench-press',
        name: 'Dumbbell Bench Press',
        category: 'Chest',
        difficulty: 'Intermediate',
        cover: '/images/exercises/dumbbell-bench-press-cover.png',
        primaryMuscles: ['Pectoralis Major'],
        secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii'],
        tips: 'Keep your shoulder blades retracted and your feet flat on the ground.',
      },
    ],
  },
]

export function getWorkoutPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Initialize with default plan on first visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLANS))
      return DEFAULT_PLANS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load workout plans from localStorage:', err)
    return []
  }
}

export function saveWorkoutPlans(plans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    window.dispatchEvent(new CustomEvent('fitvision:plans-updated', { detail: plans }))
    return true
  } catch (err) {
    console.error('Failed to save workout plans to localStorage:', err)
    return false
  }
}

export function createWorkoutPlan({ name, description = '' }) {
  const trimmedName = name?.trim()
  if (!trimmedName) {
    return { success: false, error: 'Plan name is required' }
  }

  const plans = getWorkoutPlans()
  const newPlan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: trimmedName,
    description: description?.trim() || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [],
  }

  const updatedPlans = [newPlan, ...plans]
  saveWorkoutPlans(updatedPlans)
  return { success: true, plan: newPlan }
}

export function deleteWorkoutPlan(planId) {
  const plans = getWorkoutPlans()
  const filtered = plans.filter((p) => p.id !== planId)
  saveWorkoutPlans(filtered)
  return { success: true }
}

export function addExerciseToPlan(planId, exercise) {
  if (!exercise || !exercise.id) {
    return { success: false, error: 'Invalid exercise data' }
  }

  const plans = getWorkoutPlans()
  const planIndex = plans.findIndex((p) => p.id === planId)

  if (planIndex === -1) {
    return { success: false, error: 'Workout plan not found' }
  }

  const targetPlan = plans[planIndex]
  const alreadyExists = targetPlan.exercises.some((e) => e.id === exercise.id)

  if (alreadyExists) {
    return {
      success: false,
      error: 'Exercise already added to this plan.',
      plan: targetPlan,
    }
  }

  const sanitizedExercise = {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category || 'General',
    difficulty: exercise.difficulty || 'All Levels',
    cover: exercise.cover || null,
    primaryMuscles: exercise.primaryMuscles || [],
    secondaryMuscles: exercise.secondaryMuscles || [],
    instructions: exercise.instructions || [],
    tips: exercise.tips || '',
    duration: exercise.duration || 18,
  }

  const updatedPlan = {
    ...targetPlan,
    updatedAt: new Date().toISOString(),
    exercises: [...targetPlan.exercises, sanitizedExercise],
  }

  plans[planIndex] = updatedPlan
  saveWorkoutPlans(plans)
  return { success: true, plan: updatedPlan }
}

export function removeExerciseFromPlan(planId, exerciseId) {
  const plans = getWorkoutPlans()
  const planIndex = plans.findIndex((p) => p.id === planId)

  if (planIndex === -1) {
    return { success: false, error: 'Workout plan not found' }
  }

  const targetPlan = plans[planIndex]
  const updatedPlan = {
    ...targetPlan,
    updatedAt: new Date().toISOString(),
    exercises: targetPlan.exercises.filter((e) => e.id !== exerciseId),
  }

  plans[planIndex] = updatedPlan
  saveWorkoutPlans(plans)
  return { success: true, plan: updatedPlan }
}

export function getWorkoutPlanById(planId) {
  const plans = getWorkoutPlans()
  return plans.find((p) => p.id === planId) || null
}
