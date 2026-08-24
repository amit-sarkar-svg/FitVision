import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, ArrowLeft } from 'lucide-react'
import Button from '../UI/Button'

export default function ExitWorkoutModal({ isOpen, onClose, onConfirm, planName = 'Workout' }) {
  if (!isOpen) return null

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
          className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 z-10"
        >
          <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-white">Exit Workout?</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-2">
            <p className="text-sm text-gray-200 mb-1.5">
              Your current <span className="font-semibold text-white">"{planName}"</span> session is not complete.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Exiting now will return you to the workout plan page. Your plan and exercises will remain safely saved.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border mt-4">
            <Button variant="secondary" size="md" onClick={onClose}>
              Continue Workout
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={onConfirm}
              className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
