import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Plus, Dumbbell, Sparkles } from 'lucide-react'
import Button from '../components/UI/Button'
import WorkoutPlanCard from '../components/Workout/WorkoutPlanCard'
import CreatePlanModal from '../components/Workout/CreatePlanModal'
import DeletePlanModal from '../components/Workout/DeletePlanModal'
import { useWorkout } from '../context/WorkoutContext'

export default function WorkoutPlans() {
  const { plans, plansLoading, plansError, deletePlan, showToast } = useWorkout()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)

  const handleDeleteConfirm = async (planId) => {
    const targetPlan = plans.find((p) => p.id === planId)
    const res = await deletePlan(planId)
    if (res.success) {
      showToast(`Deleted plan "${targetPlan?.name || 'Workout Plan'}"`)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white">Workout Plans</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium border border-accent/20">
              {plans.length} {plans.length === 1 ? 'Plan' : 'Plans'}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Build, organize, and execute tailored workout routines for your fitness goals.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0 self-start sm:self-auto shadow-glow"
        >
          <Plus className="w-4 h-4" />
          Create Workout Plan
        </Button>
      </div>

      {/* Loading State */}
      {plansLoading && plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-400">Loading workout plans…</p>
        </div>
      ) : plansError ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 rounded-2xl bg-red-500/5 border border-red-500/20 text-center max-w-md mx-auto my-8"
        >
          <p className="text-sm text-red-400 mb-2">{plansError}</p>
          <p className="text-xs text-gray-500">Please try refreshing the page.</p>
        </motion.div>
      ) : plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-12 rounded-2xl bg-surface-card border border-surface-border text-center max-w-md mx-auto my-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center text-gray-400 mb-4">
            <CalendarDays className="w-8 h-8 text-accent/70" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1.5">No workout plans yet</h2>
          <p className="text-xs text-gray-400 mb-6 max-w-xs leading-relaxed">
            Create your first workout plan to organize routines, track your progress, and stay consistent.
          </p>
          <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Workout Plan
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              index={index}
              onDeleteClick={(p) => setPlanToDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <DeletePlanModal
        isOpen={Boolean(planToDelete)}
        plan={planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
