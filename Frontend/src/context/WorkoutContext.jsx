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
  fetchFavoritesApi,
  addFavoriteApi,
  removeFavoriteApi,
} from '../utils/favoriteApi'
import { useAuth } from './AuthContext'
import Toast from '../components/UI/Toast'

const WorkoutContext = createContext(null)

export function WorkoutProvider({ children }) {
  const { isAuthenticated, authorizedRequest } = useAuth()

  // Plans state — now driven by the API
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState(null)

  // History — remains localStorage-based (out of scope)
  const [history, setHistory] = useState(() => getWorkoutHistory())
  
  // Favorites state — now driven by MongoDB API
  const [favorites, setFavorites] = useState([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [favoritesError, setFavoritesError] = useState(null)

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

  // ────────────────────── Favorites (API) ──────────────────────
  const reloadFavorites = useCallback(async () => {
    if (!authReqRef.current) return
    setFavoritesLoading(true)
    setFavoritesError(null)
    try {
      const data = await fetchFavoritesApi(authReqRef.current)
      setFavorites(data)
    } catch (err) {
      setFavoritesError(err.message || 'Failed to load favorite exercises.')
      console.error('Failed to fetch favorites:', err)
    } finally {
      setFavoritesLoading(false)
    }
  }, [])

  // Sync plans & favorites with authentication state
  useEffect(() => {
    if (isAuthenticated) {
      reloadPlans()
      reloadFavorites()
    } else {
      // Clear plans & favorites when logged out
      setPlans([])
      setPlansError(null)
      setFavorites([])
      setFavoritesError(null)
    }
  }, [isAuthenticated, reloadPlans, reloadFavorites])

  const isFavorite = useCallback((exerciseId) => {
    if (!exerciseId) return false
    const target = exerciseId.toString()
    return favorites.some((fav) => {
      const ex = fav.exercise || fav
      return (
        (ex._id && ex._id.toString() === target) ||
        (ex.id && ex.id.toString() === target) ||
        (fav._id && fav._id.toString() === target)
      )
    })
  }, [favorites])

  const addFavorite = useCallback(async (exerciseId) => {
    try {
      const newFav = await addFavoriteApi(authReqRef.current, exerciseId)
      setFavorites((prev) => [newFav, ...prev])
      return { success: true, isFavorite: true, favorite: newFav }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to add favorite.' }
    }
  }, [])

  const removeFavorite = useCallback(async (exerciseId) => {
    try {
      await removeFavoriteApi(authReqRef.current, exerciseId)
      const target = exerciseId.toString()
      setFavorites((prev) =>
        prev.filter((fav) => {
          const ex = fav.exercise || fav
          return (
            (ex._id && ex._id.toString() !== target) &&
            (ex.id && ex.id.toString() !== target)
          )
        })
      )
      return { success: true, isFavorite: false }
    } catch (err) {
      return { success: false, error: err.message || 'Failed to remove favorite.' }
    }
  }, [])

  const toggleFavorite = useCallback(async (exerciseId) => {
    if (isFavorite(exerciseId)) {
      return await removeFavorite(exerciseId)
    } else {
      return await addFavorite(exerciseId)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  // Keep localStorage-based event listeners for History (out of scope)
  useEffect(() => {
    const handleHistoryUpdate = () => reloadHistory()
    const handleStorageUpdate = (e) => {
      if (e.key === 'fitvision_workout_history') reloadHistory()
    }

    window.addEventListener('fitvision:history-updated', handleHistoryUpdate)
    window.addEventListener('storage', handleStorageUpdate)

    return () => {
      window.removeEventListener('fitvision:history-updated', handleHistoryUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [reloadHistory])

  return (
    <WorkoutContext.Provider
      value={{
        plans,
        plansLoading,
        plansError,
        history,
        favorites,
        favoritesLoading,
        favoritesError,
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
