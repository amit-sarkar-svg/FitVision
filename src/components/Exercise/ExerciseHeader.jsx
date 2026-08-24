import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarPlus, Heart, MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

export default function ExerciseHeader({ exercise, isFavorite, onToggleFavorite, onAddToPlan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Link
        to="/exercises"
        className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-bright transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Exercises
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{exercise.name}</h1>
            <Badge>{exercise.category}</Badge>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">{exercise.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAddToPlan && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToPlan}
              className="hidden sm:inline-flex"
            >
              <CalendarPlus className="w-4 h-4" />
              Add to Plan
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleFavorite}
            className={`transition-all ${
              isFavorite
                ? 'text-red-400 border-red-500/40 bg-red-500/10 hover:bg-red-500/20'
                : 'text-gray-300 hover:text-white'
            }`}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-400' : ''}`} />
            <span className="hidden sm:inline">
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </span>
          </Button>

          <Button variant="icon" aria-label="More options">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
