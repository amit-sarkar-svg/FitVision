import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null

  const isSuccess = toast.type === 'success' || !toast.type
  const isError = toast.type === 'error'
  const isWarning = toast.type === 'warning'

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${
            isSuccess
              ? 'bg-surface-card/95 border-accent/40 text-white'
              : isError || isWarning
              ? 'bg-surface-card/95 border-red-500/40 text-white'
              : 'bg-surface-card/95 border-surface-border text-white'
          }`}
        >
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />}
          {(isError || isWarning) && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
          {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

          <div className="flex-1 pr-2">
            {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
            <p className="text-xs text-gray-300 leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
