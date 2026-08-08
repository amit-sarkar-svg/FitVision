import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarPlus, Heart, MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import Badge from '../UI/Badge'
import Button from '../UI/Button'

export default function ExerciseHeader({ exercise, isFavorite, onToggleFavorite }) {
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
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <CalendarPlus className="w-4 h-4" />
            Add to Plan
          </Button>
          <Button
            variant="icon"
            onClick={onToggleFavorite}
            className={isFavorite ? 'text-red-400 border-red-400/30 bg-red-400/10' : ''}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="icon" aria-label="More options">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
