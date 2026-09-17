import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchPlans,
  createPlanApi,
  deletePlanApi,
  addExerciseApi,
  addExercisesBatchApi,
  removeExerciseApi,
  fetchPlanById,
} from '../utils/workoutPlanApi'
import {
  getWorkoutHistory,
  saveCompletedWorkout as saveCompletedWorkoutStorage,
  clearWorkoutHistory as clearWorkoutHistoryStorage,
  getWorkoutStatistics,
  getWeeklyActivity,
} from '../utils/workoutHistory'
import {
  getFavoriteExerciseIds,
  addFavoriteExercise as addFavoriteStorage,
  removeFavoriteExercise as removeFavoriteStorage,
  toggleFavoriteExercise as toggleFavoriteStorage,
  isExerciseFavorite as isFavoriteStorage,
} from '../utils/favoritesStorage'
import { useAuth } from './AuthContext'
import Toast from '../components/UI/Toast'

const WorkoutContext = createContext(null)

export function WorkoutProvider({ children }) {
  const { isAuthenticated, authorizedRequest } = useAuth()

  // Plans state — now driven by the API
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState(null)

  // History & Favorites — remain localStorage-based (out of scope)
  const [history, setHistory] = useState(() => getWorkoutHistory())
  const [favorites, setFavorites] = useState(() => getFavoriteExerciseIds())
  const [toast, setToast] = useState(null)

  // Track the latest authorizedRequest ref so callbacks never become stale
  const authReqRef = useRef(authorizedRequest)
  useEffect(() => { authReqRef.current = authorizedRequest }, [authorizedRequest])

  // ────────────────────── Toast ──────────────────────
  const showToast = useCallback((message, type = 'success', title = '') => {
    setToast({ message, type, title })
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr))
    }, 3500)
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  // ────────────────────── Plans (API) ──────────────────────
  const reloadPlans = useCallback(async () => {
    if (!authReqRef.current) return
    setPlansLoading(true)
    setPlansError(null)
    try {
      const data = await fetchPlans(authReqRef.current)
      setPlans(data)
    } catch (err) {
      setPlansError(err.message || 'Failed to load workout plans.')
      console.error('Failed to fetch workout plans:', err)
    } finally {
      setPlansLoading(false)
    }
  }, [])

  // Fetch plans when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      reloadPlans()
    } else {
      // Clear plans when logged out
      setPlans([])
      setPlansError(null)
    }
  }, [isAuthenticated, reloadPlans])

  const createPlan = useCallback(async (data) => {
    try {
      const plan = await createPlanApi(authReqRef.current, data)
      setPlans((prev) => [plan, ...prev])
      return { success: true, plan }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to create plan.' }
    }
  }, [])

  const deletePlan = useCallback(async (planId) => {
    try {
      await deletePlanApi(authReqRef.current, planId)
      setPlans((prev) => prev.filter((p) => p.id !== planId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to delete plan.' }
    }
  }, [])

  const addExercise = useCallback(async (planId, exercise) => {
    try {
      // Send the exercise's MongoDB _id (or slug id) to the backend
      const exerciseId = exercise._id || exercise.id
      const updatedPlan = await addExerciseApi(authReqRef.current, planId, exerciseId)
      setPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)))
      return { success: true, plan: updatedPlan }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to add exercise.' }
    }
  }, [])

  const addExercises = useCallback(async (planId, exercisesToAdd) => {
    try {
      const exerciseIds = exercisesToAdd.map((e) => e._id || e.id)
      const updatedPlan = await addExercisesBatchApi(authReqRef.current, planId, exerciseIds)
      setPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)))
      return { success: true, plan: updatedPlan }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to add exercises.' }
    }
  }, [])

  const removeExercise = useCallback(async (planId, exerciseId) => {
    try {
      const updatedPlan = await removeExerciseApi(authReqRef.current, planId, exerciseId)
      setPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)))
      return { success: true, plan: updatedPlan }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to remove exercise.' }
    }
  }, [])

  const getPlanById = useCallback((planId) => {
    // Synchronous lookup from the already-loaded plans array
    return plans.find((p) => p.id === planId) || null
  }, [plans])

  // ────────────────────── History (localStorage — unchanged) ──────────────────────
  const reloadHistory = useCallback(() => {
    setHistory(getWorkoutHistory())
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

  // ────────────────────── Favorites (localStorage — unchanged) ──────────────────────
  const reloadFavorites = useCallback(() => {
    setFavorites(getFavoriteExerciseIds())
  }, [])

  const isFavorite = useCallback((exerciseId) => {
    return favorites.includes(exerciseId)
  }, [favorites])

  const addFavorite = useCallback((exerciseId) => {
    const res = addFavoriteStorage(exerciseId)
    if (res.success) {
      reloadFavorites()
    }
    return res
  }, [reloadFavorites])

  const removeFavorite = useCallback((exerciseId) => {
    const res = removeFavoriteStorage(exerciseId)
    if (res.success) {
      reloadFavorites()
    }
    return res
  }, [reloadFavorites])

  const toggleFavorite = useCallback((exerciseId) => {
    const res = toggleFavoriteStorage(exerciseId)
    if (res.success) {
      reloadFavorites()
    }
    return res
  }, [reloadFavorites])

  // Keep localStorage-based event listeners for History & Favorites
  useEffect(() => {
    const handleHistoryUpdate = () => reloadHistory()
    const handleFavoritesUpdate = () => reloadFavorites()
    const handleStorageUpdate = (e) => {
      if (e.key === 'fitvision_workout_history') reloadHistory()
      if (e.key === 'fitvision_favorite_exercises') reloadFavorites()
    }

    window.addEventListener('fitvision:history-updated', handleHistoryUpdate)
    window.addEventListener('fitvision:favorites-updated', handleFavoritesUpdate)
    window.addEventListener('storage', handleStorageUpdate)

    return () => {
      window.removeEventListener('fitvision:history-updated', handleHistoryUpdate)
      window.removeEventListener('fitvision:favorites-updated', handleFavoritesUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [reloadHistory, reloadFavorites])

  return (
    <WorkoutContext.Provider
      value={{
        plans,
        plansLoading,
        plansError,
        history,
        favorites,
        createPlan,
        deletePlan,
        addExercise,
        addExercises,
        removeExercise,
        getPlanById,
        recordWorkoutCompletion,
        clearHistory,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        showToast,
        reloadPlans,
        reloadHistory,
        reloadFavorites,
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
