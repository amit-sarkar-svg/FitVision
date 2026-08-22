import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getWorkoutPlans,
  createWorkoutPlan as createPlanStorage,
  deleteWorkoutPlan as deletePlanStorage,
  addExerciseToPlan as addExerciseStorage,
  removeExerciseFromPlan as removeExerciseStorage,
  getWorkoutPlanById as getPlanByIdStorage,
} from '../utils/workoutStorage'
import Toast from '../components/UI/Toast'

const WorkoutContext = createContext(null)

export function WorkoutProvider({ children }) {
  const [plans, setPlans] = useState(() => getWorkoutPlans())
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success', title = '') => {
    setToast({ message, type, title })
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr))
    }, 3500)
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  const reloadPlans = useCallback(() => {
    setPlans(getWorkoutPlans())
  }, [])

  useEffect(() => {
    const handleStorageUpdate = () => {
      reloadPlans()
    }
    window.addEventListener('fitvision:plans-updated', handleStorageUpdate)
    window.addEventListener('storage', handleStorageUpdate)
    return () => {
      window.removeEventListener('fitvision:plans-updated', handleStorageUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [reloadPlans])

  const createPlan = useCallback((data) => {
    const res = createPlanStorage(data)
    if (res.success) {
      reloadPlans()
    }
    return res
  }, [reloadPlans])

  const deletePlan = useCallback((planId) => {
    const res = deletePlanStorage(planId)
    if (res.success) {
      reloadPlans()
    }
    return res
  }, [reloadPlans])

  const addExercise = useCallback((planId, exercise) => {
    const res = addExerciseStorage(planId, exercise)
    if (res.success) {
      reloadPlans()
    }
    return res
  }, [reloadPlans])

  const removeExercise = useCallback((planId, exerciseId) => {
    const res = removeExerciseStorage(planId, exerciseId)
    if (res.success) {
      reloadPlans()
    }
    return res
  }, [reloadPlans])

  const getPlanById = useCallback((planId) => {
    return getPlanByIdStorage(planId)
  }, [])

  return (
    <WorkoutContext.Provider
      value={{
        plans,
        createPlan,
        deletePlan,
        addExercise,
        removeExercise,
        getPlanById,
        showToast,
        reloadPlans,
      }}
    >
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}
