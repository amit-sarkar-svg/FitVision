import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarPlus, AlertCircle, Check } from 'lucide-react'
import Button from '../UI/Button'
import { useWorkout } from '../../context/WorkoutContext'

export default function CreatePlanModal({ isOpen, onClose }) {
  const { createPlan, showToast } = useWorkout()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter a plan name')
      return
    }

    setSubmitting(true)
    try {
      const res = await createPlan({ name, description })
      if (res.success) {
        showToast(`Workout plan "${res.plan.name}" created!`)
        setName('')
        setDescription('')
        onClose()
      } else {
        setError(res.error || 'Failed to create plan')
      }
    } finally {
      setSubmitting(false)
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 z-10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                <CalendarPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Create Workout Plan</h2>
                <p className="text-xs text-gray-400">Build a structured routine tailored to your goals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">Plan Name *</label>
              <input
                type="text"
                placeholder="e.g. Chest Workout, Push Day, Leg Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">Description (Optional)</label>
              <textarea
                placeholder="e.g. Focused upper body routine targeting chest and triceps"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-surface border border-surface-border rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border mt-4">
              <Button type="button" variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={submitting}>
                <Check className="w-4 h-4" />
                {submitting ? 'Creating…' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
