import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  ArrowRight,
  Check,
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Badge from '../components/UI/Badge'
import { apiRequest, exerciseMediaUrl } from '../utils/api'
import { useWorkout } from '../context/WorkoutContext'

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']

export default function Exercises() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const planId = searchParams.get('planId')
  const isSelectionMode = Boolean(planId)

  const { getPlanById, addExercises, showToast, plansLoading } = useWorkout()
  const activePlan = planId ? getPlanById(planId) : null

  const [exercises, setExercises] = useState([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Set of selected exercise IDs in selection mode
  const [selectedExerciseIds, setSelectedExerciseIds] = useState(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setLoadingExercises(true)
    apiRequest('/exercises')
      .then((response) => {
        setExercises(response.data || [])
      })
      .catch((requestError) => {
        setError(requestError.message || 'Failed to load exercises.')
      })
      .finally(() => {
        setLoadingExercises(false)
      })
  }, [])

  // Helper to check if an exercise is already in the current active plan
  const isAlreadyInPlan = (exercise) => {
    if (!activePlan || !activePlan.exercises) return false
    return activePlan.exercises.some((e) => {
      const exRefId = e._id || e.id
      const targetMongoId = exercise._id?.toString()
      const targetSlugId = exercise.id
      return (
        (targetMongoId && (e._id === targetMongoId || e.id === targetMongoId)) ||
        (targetSlugId && (e.id === targetSlugId || e._id === targetSlugId))
      )
    })
  }

  // Toggle selection for an exercise
  const toggleSelectExercise = (exercise) => {
    if (isAlreadyInPlan(exercise)) return
    const idKey = exercise._id || exercise.id
    setSelectedExerciseIds((prev) => {
      const next = new Set(prev)
      if (next.has(idKey)) {
        next.delete(idKey)
      } else {
        next.add(idKey)
      }
      return next
    })
  }

  // Confirm and add selected exercises
  const handleAddSelected = async () => {
    if (selectedExerciseIds.size === 0 || !planId) return
    setIsSubmitting(true)

    const exercisesToAdd = exercises.filter((e) =>
      selectedExerciseIds.has(e._id || e.id),
    )

    const res = await addExercises(planId, exercisesToAdd)
    setIsSubmitting(false)

    if (res.success) {
      showToast(
        `Added ${exercisesToAdd.length} exercise${exercisesToAdd.length > 1 ? 's' : ''} to "${activePlan?.name || 'Workout Plan'}"`,
      )
      navigate(`/workout-plans/${planId}`)
    } else {
      showToast(res.error || 'Failed to add exercises to plan.', 'error')
    }
  }

  // Filter exercises by category and search term
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        ex.category?.toLowerCase() === selectedCategory.toLowerCase()

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        ex.name?.toLowerCase().includes(query) ||
        ex.category?.toLowerCase().includes(query) ||
        ex.difficulty?.toLowerCase().includes(query) ||
        ex.primaryMuscles?.some((m) => m.toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })
  }, [exercises, selectedCategory, searchQuery])

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* ────────────────────── Selection Mode Context Header ────────────────────── */}
      {isSelectionMode ? (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link
                to={`/workout-plans/${planId}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {activePlan?.name || 'Workout Plan'}
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Add Exercises to{' '}
                  <span className="text-accent">{activePlan?.name || 'Workout Plan'}</span>
                </h1>
                <Badge variant="default" className="text-xs">
                  {selectedExerciseIds.size} Selected
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Select exercises below and confirm to add them to your workout plan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link to={`/workout-plans/${planId}`}>
                <Button variant="ghost" size="md" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddSelected}
                disabled={selectedExerciseIds.size === 0 || isSubmitting}
                className="shadow-glow font-semibold"
              >
                <Check className="w-4 h-4" />
                {isSubmitting
                  ? 'Adding Exercises…'
                  : `Add Selected Exercises (${selectedExerciseIds.size})`}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ────────────────────── Normal Header ────────────────────── */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Exercises</h1>
            <p className="text-sm text-gray-400">
              Browse and learn exercises with interactive 3D visualization.
            </p>
          </div>
        </div>
      )}

      {/* ────────────────────── Search & Category Filters ────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search exercises by name, muscle, difficulty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-accent text-surface font-semibold shadow-glow'
                    : 'bg-surface border border-surface-border text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* ────────────────────── Exercises Grid ────────────────────── */}
      {loadingExercises ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-400">Loading exercise library…</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center max-w-md mx-auto my-8">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-400 mb-1">{error}</p>
          <p className="text-xs text-gray-500">Please verify your connection or try again.</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-white mb-1">No exercises found</h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {searchQuery
              ? `No exercises matching "${searchQuery}". Try different search keywords.`
              : 'No exercises available in this category yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise, index) => {
            const idKey = exercise._id || exercise.id
            const inPlan = isSelectionMode && isAlreadyInPlan(exercise)
            const isSelected = isSelectionMode && selectedExerciseIds.has(idKey)

            if (isSelectionMode) {
              /* Selection Mode Card */
              return (
                <motion.div
                  key={exercise._id || exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <Card
                    onClick={() => toggleSelectExercise(exercise)}
                    className={`relative flex flex-col h-full transition-all select-none ${
                      inPlan
                        ? 'opacity-65 border-surface-border bg-surface/40 cursor-not-allowed'
                        : isSelected
                        ? 'border-accent ring-2 ring-accent/30 bg-accent/5 shadow-glow cursor-pointer'
                        : 'hover:border-accent/50 cursor-pointer group'
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 mb-4 flex items-center justify-center overflow-hidden">
                      <Dumbbell className="w-10 h-10 text-gray-600 group-hover:text-accent/50 transition-colors" />
                      {exercise.cover ? (
                        <img
                          src={exerciseMediaUrl(exercise.media?.coverImage || exercise.cover)}
                          alt=""
                          aria-hidden="true"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}

                      {/* Top-Right Selection Indicator Badge / Checkbox */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        {inPlan ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-surface/90 text-accent border border-accent/30 backdrop-blur-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            In Plan
                          </span>
                        ) : isSelected ? (
                          <div className="w-7 h-7 rounded-lg bg-accent text-surface flex items-center justify-center shadow-glow">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg border-2 border-white/40 bg-surface/60 group-hover:border-accent/80 transition-colors backdrop-blur-sm" />
                        )}
                      </div>
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h2
                          className={`text-sm font-semibold transition-colors ${
                            isSelected ? 'text-accent' : 'text-white group-hover:text-accent'
                          }`}
                        >
                          {exercise.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge>{exercise.category}</Badge>
                          <span className="text-xs text-gray-400">{exercise.difficulty}</span>
                        </div>
                      </div>

                      {/* Bottom Info Row */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-surface-border/50 text-xs">
                        <span className="text-gray-500">
                          {inPlan
                            ? 'Already added to plan'
                            : isSelected
                            ? 'Selected for plan'
                            : 'Click card to select'}
                        </span>
                        <Link
                          to={`/exercises/${exercise._id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-accent transition-colors inline-flex items-center gap-1"
                        >
                          Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            }

            /* Normal Mode Card */
            return (
              <motion.div
                key={exercise._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <Link to={`/exercises/${exercise._id}`}>
                  <Card className="group hover:border-accent/30 transition-all cursor-pointer h-full flex flex-col">
                    <div className="relative aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 mb-4 flex items-center justify-center overflow-hidden">
                      <Dumbbell className="w-10 h-10 text-gray-600 group-hover:text-accent/50 transition-colors" />
                      {exercise.cover ? (
                        <img
                          src={exerciseMediaUrl(exercise.media?.coverImage || exercise.cover)}
                          alt=""
                          aria-hidden="true"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="flex items-start justify-between gap-2 mt-auto">
                      <div>
                        <h2 className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                          {exercise.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge>{exercise.category}</Badge>
                          <span className="text-xs text-gray-500">{exercise.difficulty}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-accent transition-colors shrink-0 mt-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ────────────────────── Sticky Floating Bottom Confirmation Bar ────────────────────── */}
      <AnimatePresence>
        {isSelectionMode && selectedExerciseIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl"
          >
            <div className="bg-surface-card/95 backdrop-blur-md border border-accent/40 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedExerciseIds.size}{' '}
                  {selectedExerciseIds.size === 1 ? 'exercise' : 'exercises'} selected
                </p>
                <p className="text-xs text-gray-400">
                  Adding to{' '}
                  <span className="text-accent font-medium">
                    {activePlan?.name || 'Workout Plan'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExerciseIds(new Set())}
                  disabled={isSubmitting}
                  className="text-xs text-gray-400"
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddSelected}
                  disabled={isSubmitting}
                  className="shadow-glow text-xs sm:text-sm font-semibold"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'Adding…' : 'Add Selected Exercises'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
