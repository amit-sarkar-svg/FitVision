import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Eye, Trash2, Dumbbell, Calendar, Plus } from 'lucide-react'
import Card from '../UI/Card'
import Button from '../UI/Button'
import Badge from '../UI/Badge'

export default function WorkoutPlanCard({ plan, onDeleteClick, index = 0 }) {
  const exerciseCount = plan.exercises?.length || 0
  const previewExercises = plan.exercises?.slice(0, 4) || []
  const remainingCount = exerciseCount - previewExercises.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="flex flex-col h-full group hover:border-accent/30 transition-all">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white group-hover:text-accent transition-colors truncate">
              {plan.name}
            </h2>
            {plan.description ? (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{plan.description}</p>
            ) : (
              <p className="text-xs text-gray-500 italic mt-1">No description provided</p>
            )}
          </div>

          <button
            onClick={() => onDeleteClick(plan)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
            title="Delete plan"
            aria-label={`Delete ${plan.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Exercise Count & Details */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" className="text-xs">
            <Dumbbell className="w-3 h-3 mr-1" />
            {exerciseCount} {exerciseCount === 1 ? 'Exercise' : 'Exercises'}
          </Badge>
        </div>

        {/* Exercise Previews List */}
        <div className="flex-1 bg-surface/50 border border-surface-border rounded-xl p-3 mb-4 space-y-1.5">
          {exerciseCount === 0 ? (
            <p className="text-xs text-gray-500 italic py-2 text-center">No exercises added yet</p>
          ) : (
            <>
              {previewExercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="truncate font-medium">{exercise.name}</span>
                  <span className="text-[10px] text-gray-500 ml-auto shrink-0">{exercise.category}</span>
                </div>
              ))}
              {remainingCount > 0 && (
                <p className="text-[11px] text-gray-500 pl-3.5 pt-0.5">+{remainingCount} more exercises</p>
              )}
            </>
          )}
        </div>

        {/* Actions Footer */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-border mt-auto">
          <Link to={`/workout-plans/${plan.id}`} className="w-full">
            <Button variant="secondary" size="md" className="w-full text-xs">
              <Eye className="w-3.5 h-3.5" />
              View Plan
            </Button>
          </Link>

          {exerciseCount === 0 ? (
            <Link to={`/exercises?planId=${plan.id}`} className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full text-xs shadow-none hover:shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </Button>
            </Link>
          ) : (
            <Link to={`/workout-plans/${plan.id}/session`} className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full text-xs shadow-none hover:shadow-glow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Workout
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
