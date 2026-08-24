import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getWorkoutPlans,
  createWorkoutPlan as createPlanStorage,
  deleteWorkoutPlan as deletePlanStorage,
  addExerciseToPlan as addExerciseStorage,
  removeExerciseFromPlan as removeExerciseStorage,
  getWorkoutPlanById as getPlanByIdStorage,
} from '../utils/workoutStorage'
import {
  getWorkoutHistory,
  saveCompletedWorkout as saveCompletedWorkoutStorage,
  clearWorkoutHistory as clearWorkoutHistoryStorage,
  getWorkoutStatistics,
  getWeeklyActivity,
} from '../utils/workoutHistory'
import Toast from '../components/UI/Toast'

const WorkoutContext = createContext(null)

export function WorkoutProvider({ children }) {
  const [plans, setPlans] = useState(() => getWorkoutPlans())
  const [history, setHistory] = useState(() => getWorkoutHistory())
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

  const reloadHistory = useCallback(() => {
    setHistory(getWorkoutHistory())
  }, [])

  useEffect(() => {
    const handlePlansUpdate = () => {
      reloadPlans()
    }
    const handleHistoryUpdate = () => {
      reloadHistory()
    }
    const handleStorageUpdate = (e) => {
      if (e.key === 'fitvision_workout_plans') reloadPlans()
      if (e.key === 'fitvision_workout_history') reloadHistory()
    }

    window.addEventListener('fitvision:plans-updated', handlePlansUpdate)
    window.addEventListener('fitvision:history-updated', handleHistoryUpdate)
    window.addEventListener('storage', handleStorageUpdate)

    return () => {
      window.removeEventListener('fitvision:plans-updated', handlePlansUpdate)
      window.removeEventListener('fitvision:history-updated', handleHistoryUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [reloadPlans, reloadHistory])

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

  const recordWorkoutCompletion = useCallback((workoutData) => {
    const res = saveCompletedWorkoutStorage(workoutData)
    if (res.success) {
      reloadHistory()
    }
    return res
  }, [reloadHistory])

  const clearHistory = useCallback(() => {
    const res = clearWorkoutHistoryStorage()
    if (res) {
      reloadHistory()
    }
    return res
  }, [reloadHistory])

  return (
    <WorkoutContext.Provider
      value={{
        plans,
        history,
        createPlan,
        deletePlan,
        addExercise,
        removeExercise,
        getPlanById,
        recordWorkoutCompletion,
        clearHistory,
        showToast,
        reloadPlans,
        reloadHistory,
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
