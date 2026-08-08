import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../UI/Card'
import Badge from '../UI/Badge'

function RelatedExerciseCard({ exercise, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="shrink-0 w-[160px] sm:w-[180px]"
    >
      <Link to={`/exercises/${exercise.id}`} className="block group">
        <div className="rounded-xl overflow-hidden border border-surface-border bg-surface hover:border-accent/30 transition-all">
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 80 60" className="w-16 h-12 opacity-60 group-hover:opacity-80 transition-opacity" fill="none">
              <ellipse cx="40" cy="20" rx="10" ry="8" fill="#6B7280" />
              <rect x="25" y="28" width="30" height="12" rx="3" fill="#4B5563" />
              <ellipse cx="40" cy="34" rx="12" ry="6" fill="#EF4444" opacity="0.5" />
            </svg>
          </div>
          <div className="p-3">
            <p className="text-sm font-medium text-white truncate group-hover:text-accent transition-colors">
              {exercise.name}
            </p>
            <Badge className="mt-1.5">{exercise.category}</Badge>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function RelatedExercises({ exercises }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Related Exercises</h3>
        <Link to="/exercises" className="text-xs text-accent hover:text-accent-bright transition-colors">
          View All →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {exercises.map((exercise, index) => (
          <RelatedExerciseCard key={exercise.id} exercise={exercise} index={index} />
        ))}
      </div>
    </Card>
  )
}
