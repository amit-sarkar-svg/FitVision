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
  fetchFavoritesApi,
  addFavoriteApi,
  removeFavoriteApi,
} from '../utils/favoriteApi'
import {
  fetchWorkoutHistory,
  fetchProgress,
  createWorkoutHistoryApi,
  deleteWorkoutHistoryApi,
} from '../utils/workoutHistoryApi'
import { useAuth } from './AuthContext'
import Toast from '../components/UI/Toast'

const WorkoutContext = createContext(null)

export function WorkoutProvider({ children }) {
  const { isAuthenticated, authorizedRequest } = useAuth()

  // Plans state — driven by the API
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState(null)

  // History & Progress state — now driven by MongoDB API
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [progress, setProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState(null)
  
  // Favorites state — driven by MongoDB API
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

  // ────────────────────── History & Progress (API) ──────────────────────
  const reloadHistory = useCallback(async () => {
    if (!authReqRef.current) return
    setHistoryLoading(true)
    setProgressLoading(true)
    setHistoryError(null)
    setProgressError(null)
    try {
      const [histData, progData] = await Promise.all([
        fetchWorkoutHistory(authReqRef.current),
        fetchProgress(authReqRef.current),
      ])
      setHistory(histData)
      setProgress(progData)
    } catch (err) {
      console.error('Failed to fetch history/progress:', err)
      setHistoryError(err.message || 'Failed to load workout history.')
      setProgressError(err.message || 'Failed to load workout progress.')
    } finally {
      setHistoryLoading(false)
      setProgressLoading(false)
    }
  }, [])

  const recordWorkoutCompletion = useCallback(async (workoutData) => {
    try {
      if (!authReqRef.current) {
        return { success: false, error: 'User is not authenticated.' }
      }
      const savedRecord = await createWorkoutHistoryApi(authReqRef.current, workoutData)
      setHistory((prev) => [savedRecord, ...prev])
      try {
        const updatedProg = await fetchProgress(authReqRef.current)
        setProgress(updatedProg)
      } catch (err) {
        console.warn('Could not refresh progress immediately:', err)
      }
      return { success: true, record: savedRecord }
    } catch (err) {
      console.error('Failed to save workout history:', err)
      return { success: false, error: err.message || 'Failed to save workout history.' }
    }
  }, [])

  const clearHistory = useCallback(async () => {
    try {
      if (history.length > 0 && authReqRef.current) {
        await Promise.all(
          history.map((h) => deleteWorkoutHistoryApi(authReqRef.current, h.id || h._id))
        )
      }
      setHistory([])
      if (authReqRef.current) {
        const progData = await fetchProgress(authReqRef.current)
        setProgress(progData)
      }
      return { success: true }
    } catch (err) {
      console.error('Failed to clear workout history:', err)
      return { success: false, error: err.message || 'Failed to clear workout history.' }
    }
  }, [history])

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

  // Sync plans, favorites & history with authentication state
  useEffect(() => {
    if (isAuthenticated) {
      reloadPlans()
      reloadFavorites()
      reloadHistory()
    } else {
      // Clear state when logged out
      setPlans([])
      setPlansError(null)
      setFavorites([])
      setFavoritesError(null)
      setHistory([])
      setHistoryError(null)
      setProgress(null)
      setProgressError(null)
    }
  }, [isAuthenticated, reloadPlans, reloadFavorites, reloadHistory])

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

  return (
    <WorkoutContext.Provider
      value={{
        plans,
        plansLoading,
        plansError,
        history,
        historyLoading,
        historyError,
        progress,
        progressLoading,
        progressError,
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
