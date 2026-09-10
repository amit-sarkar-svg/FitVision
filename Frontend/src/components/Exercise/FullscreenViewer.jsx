import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import ExerciseControls from './ExerciseControls'

export default function FullscreenViewer({
  isOpen,
  onClose,
  exercise,
  mode,
  isPlaying,
  currentTime,
  duration,
  volume,
  speed,
  onPlayPause,
  onSeek,
  onVolumeChange,
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
          {/* Main viewer area */}
          <div className="relative flex-1 bg-gradient-to-br from-[#0a0f1a] to-[#0d0d0d] overflow-hidden">
            {/* Exercise visualization placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-3 bg-gray-600 rounded-sm mb-1" />
                <svg viewBox="0 0 160 100" className="w-56 h-36" fill="none">
                  <ellipse cx="80" cy="40" rx="16" ry="12" fill="#4B5563" />
                  <rect x="40" y="50" width="80" height="18" rx="5" fill="#6B7280" />
                  <ellipse cx="80" cy="58" rx="24" ry="10" fill="#EF4444" opacity="0.7" />
                  <circle cx="48" cy="52" r="8" fill="#F97316" opacity="0.5" />
                  <circle cx="112" cy="52" r="8" fill="#F97316" opacity="0.5" />
                  <rect x="28" y="56" width="10" height="28" rx="4" fill="#6B7280" />
                  <rect x="122" y="56" width="10" height="28" rx="4" fill="#6B7280" />
                </svg>
                <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-widest">
                  {mode === '3d' ? '3D Exercise Viewer' : 'Real Video'}
                </p>
              </div>
            </div>

            {/* Top overlays */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-start justify-between bg-gradient-to-b from-black/80 to-transparent">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{exercise.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{exercise.category} · {exercise.difficulty}</p>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface/80 backdrop-blur-sm border border-surface-border text-sm text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </button>
            </div>

            {/* Target muscle overlay */}
            <div className="absolute top-20 left-4 sm:left-6 px-4 py-3 rounded-xl bg-surface/80 backdrop-blur-sm border border-surface-border">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Target Muscle</p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-muscle-primary" />
                <span className="text-sm font-medium text-white">
                  {exercise.primaryMuscles[0]} (Chest)
                </span>
              </div>
            </div>

            {/* Correct form panel */}
            <div className="absolute bottom-24 left-4 sm:left-6 px-4 py-3 rounded-xl bg-surface/90 backdrop-blur-sm border border-surface-border max-w-xs">
              <p className="text-xs font-semibold text-white mb-2">Correct Form</p>
              <ul className="space-y-1.5">
                {exercise.correctForm.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Speed indicator */}
            <div className="absolute bottom-24 right-4 sm:right-6 px-3 py-1.5 rounded-lg bg-surface/80 backdrop-blur-sm border border-surface-border">
              <span className="text-xs text-gray-400">Speed: </span>
              <span className="text-xs font-medium text-accent">{speed}</span>
            </div>
          </div>

          {/* Bottom controls */}
          <ExerciseControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onFullscreen={onClose}
            compact
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
