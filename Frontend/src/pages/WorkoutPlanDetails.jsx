import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Dumbbell,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Badge from '../components/UI/Badge'
import DeletePlanModal from '../components/Workout/DeletePlanModal'
import { useWorkout } from '../context/WorkoutContext'

export default function WorkoutPlanDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPlanById, removeExercise, deletePlan, showToast, plansLoading } = useWorkout()
  const plan = getPlanById(id)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [removingExerciseId, setRemovingExerciseId] = useState(null)

  if (plansLoading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Loading workout plan…</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Workout Plan Not Found</h2>
          <p className="text-xs text-gray-400 mb-6">The requested plan might have been removed or doesn't exist.</p>
          <Link to="/workout-plans">
            <Button variant="primary" size="md">
              <ArrowLeft className="w-4 h-4" />
              Back to Workout Plans
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const exercises = plan?.exercises || []

  const handleRemoveExercise = async (exerciseId, exerciseName) => {
    setRemovingExerciseId(exerciseId)
    const res = await removeExercise(plan.id, exerciseId)
    setRemovingExerciseId(null)
    if (res.success) {
      showToast(`Removed "${exerciseName}" from ${plan.name}`)
    } else {
      showToast(res.error || 'Failed to remove exercise', 'error')
    }
  }

  const handleDeletePlan = async () => {
    const res = await deletePlan(plan.id)
    if (res.success) {
      showToast(`Deleted plan "${plan.name}"`)
      navigate('/workout-plans')
    } else {
      showToast(res.error || 'Failed to delete plan', 'error')
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/workout-plans"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workout Plans
        </Link>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Plan
        </button>
      </div>

      {/* Plan Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{plan.name}</h1>
              <Badge variant="default">
                {exercises.length} {exercises.length === 1 ? 'Exercise' : 'Exercises'}
              </Badge>
            </div>
            {plan.description && (
              <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">{plan.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to={`/exercises?planId=${plan.id}`}>
              <Button variant="secondary" size="md">
                <Plus className="w-4 h-4" />
                Add Exercise
              </Button>
            </Link>

            <Link to={exercises.length > 0 ? `/workout-plans/${plan.id}/session` : '#'}>
              <Button
                variant="primary"
                size="md"
                disabled={exercises.length === 0}
                className="shadow-glow"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Workout
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Exercises List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Exercises in this routine ({exercises.length})
          </h2>
          {exercises.length > 0 && (
            <Link to={`/exercises?planId=${plan.id}`}>
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent text-xs">
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </Button>
            </Link>
          )}
        </div>

        {exercises.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <Dumbbell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white mb-1">No exercises in this plan</h3>
            <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
              Browse the exercise library and select exercises to build your workout.
            </p>
            <Link to={`/exercises?planId=${plan.id}`}>
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4" />
                Add Exercise
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, delay: index * 0.04 }}
                >
                  <Card className="p-4 flex items-center justify-between gap-4 group hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Index badge */}
                      <span className="w-7 h-7 rounded-lg bg-surface border border-surface-border text-gray-400 font-semibold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Exercise Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-surface-hover border border-surface-border overflow-hidden shrink-0 flex items-center justify-center">
                        {exercise.cover ? (
                          <img
                            src={exercise.cover}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Dumbbell className="w-6 h-6 text-accent/70" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <Link
                          to={`/exercises/${exercise.id}`}
                          className="text-sm font-semibold text-white hover:text-accent transition-colors block truncate"
                        >
                          {exercise.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <Badge className="text-[10px] py-0 px-2">{exercise.category || 'Chest'}</Badge>
                          <span className="text-xs text-gray-400">{exercise.difficulty || 'All Levels'}</span>
                          {exercise.primaryMuscles?.length > 0 && (
                            <span className="text-xs text-gray-500 hidden sm:inline">
                              • Targets: {exercise.primaryMuscles.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/exercises/${exercise.id}`} className="hidden sm:block">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Details
                        </Button>
                      </Link>

                      <button
                        onClick={() => handleRemoveExercise(exercise._id || exercise.id, exercise.name)}
                        disabled={removingExerciseId === (exercise._id || exercise.id)}
                        className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                        title="Remove from plan"
                        aria-label={`Remove ${exercise.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Plan Confirmation Modal */}
      <DeletePlanModal
        isOpen={isDeleteModalOpen}
        plan={plan}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePlan}
      />
    </div>
  )
}
