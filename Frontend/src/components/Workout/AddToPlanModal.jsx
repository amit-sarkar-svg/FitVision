import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check, AlertCircle, Dumbbell, CalendarPlus } from 'lucide-react'
import Button from '../UI/Button'
import Badge from '../UI/Badge'
import { useWorkout } from '../../context/WorkoutContext'
import { exerciseMediaUrl } from '../../utils/api'

export default function AddToPlanModal({ isOpen, onClose, exercise }) {
  const { plans, createPlan, addExercise, showToast } = useWorkout()
  const [selectedPlanId, setSelectedPlanId] = useState(() => plans[0]?.id || '')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanDesc, setNewPlanDesc] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Sync selectedPlanId if not set and plans are available
  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].id)
    }
  }, [plans, selectedPlanId])

  if (!isOpen || !exercise) return null

  const handleCreateAndSelect = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (!newPlanName.trim()) {
      setErrorMessage('Please enter a plan name')
      return
    }

    setSubmitting(true)
    const res = await createPlan({ name: newPlanName, description: newPlanDesc })
    setSubmitting(false)
    if (res.success && res.plan) {
      setSelectedPlanId(res.plan.id)
      setIsCreatingNew(false)
      setNewPlanName('')
      setNewPlanDesc('')
    } else {
      setErrorMessage(res.error || 'Failed to create plan')
    }
  }

  const handleAddExercise = async () => {
    setErrorMessage('')
    const targetPlanId = selectedPlanId || plans[0]?.id
    if (!targetPlanId) {
      setErrorMessage('Please select a workout plan')
      return
    }

    setSubmitting(true)
    const res = await addExercise(targetPlanId, exercise)
    setSubmitting(false)
    if (res.success) {
      const targetPlan = plans.find((p) => p.id === targetPlanId) || res.plan
      showToast(`Added "${exercise.name}" to ${targetPlan?.name || 'workout plan'}`)
      onClose()
    } else {
      setErrorMessage(res.error || 'Failed to add exercise to plan')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Add to Workout Plan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select a plan or create a new routine</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Exercise Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/60 border border-surface-border mb-4">
            <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center overflow-hidden shrink-0 border border-surface-border">
              {(exercise.media?.coverImage || exercise.cover) ? (
                <img
                  src={exerciseMediaUrl(exercise.media?.coverImage || exercise.cover)}
                  alt={exercise.name}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Dumbbell className="w-6 h-6 text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{exercise.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-[10px] py-0 px-2">{exercise.category || 'Chest'}</Badge>
                <span className="text-[11px] text-gray-400">{exercise.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Error / Inline Alert */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {!isCreatingNew ? (
            /* Select Plan Mode */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Select a Plan:
                </label>

                {plans.length === 0 ? (
                  <div className="p-4 rounded-xl bg-surface border border-surface-border text-center">
                    <p className="text-xs text-gray-400 mb-2">No workout plans available yet.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setErrorMessage('')
                        setIsCreatingNew(true)
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Plan
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id
                      const hasExercise = plan.exercises?.some((e) => e.id === exercise.id)

                      return (
                        <div
                          key={plan.id}
                          onClick={() => {
                            setSelectedPlanId(plan.id)
                            setErrorMessage('')
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-accent/10 border-accent text-white shadow-glow'
                              : 'bg-surface border-surface-border hover:border-gray-600 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected ? 'border-accent bg-accent' : 'border-gray-500 bg-transparent'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-surface" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{plan.name}</p>
                              <p className="text-[11px] text-gray-400">
                                {plan.exercises?.length || 0} {plan.exercises?.length === 1 ? 'exercise' : 'exercises'}
                              </p>
                            </div>
                          </div>

                          {hasExercise && (
                            <span className="text-[10px] text-gray-400 bg-surface-hover px-2 py-0.5 rounded-md">
                              Already added
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Create Plan Toggle Button */}
              {plans.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('')
                    setIsCreatingNew(true)
                  }}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright font-medium transition-colors pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Create New Plan
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border mt-4">
                <Button variant="secondary" size="md" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={plans.length === 0 || !selectedPlanId || submitting}
                  onClick={handleAddExercise}
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Adding…' : 'Add Exercise'}
                </Button>
              </div>
            </div>
          ) : (
            /* Create Plan Form Mode */
            <form onSubmit={handleCreateAndSelect} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarPlus className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-white">Create Workout Plan</h3>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">Plan Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Push Day, Chest & Triceps"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  autoFocus
                  className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">Description (Optional)</label>
                <textarea
                  placeholder="e.g. Heavy compound chest movements"
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  disabled={submitting}
                  onClick={() => {
                    setErrorMessage('')
                    setIsCreatingNew(false)
                  }}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  <Check className="w-4 h-4" />
                  {submitting ? 'Creating…' : 'Create Plan'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
