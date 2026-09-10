import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Dumbbell, ArrowRight, Trash2, Sparkles, ExternalLink } from 'lucide-react'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Badge from '../components/UI/Badge'
import { useWorkout } from '../context/WorkoutContext'
import { getExerciseById } from '../data/exercises'

export default function Favorites() {
  const { favorites, removeFavorite, showToast } = useWorkout()

  // Map favorite IDs to actual exercise objects from single source of truth
  const savedExercises = useMemo(() => {
    return favorites
      .map((id) => getExerciseById(id))
      .filter((exercise) => Boolean(exercise))
  }, [favorites])

  const handleRemoveFavorite = (e, exerciseId, exerciseName) => {
    e.preventDefault()
    e.stopPropagation()
    const res = removeFavorite(exerciseId)
    if (res.success) {
      showToast(`Removed "${exerciseName}" from Favorites`, 'success')
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-2xl font-bold text-white">Favorites</h1>
            {savedExercises.length > 0 && (
              <Badge variant="default" className="text-xs">
                {savedExercises.length} {savedExercises.length === 1 ? 'Saved' : 'Saved'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-400">
            Quick access to your bookmarked exercises and training guides.
          </p>
        </div>

        {savedExercises.length > 0 && (
          <Link to="/exercises">
            <Button variant="secondary" size="md">
              <Dumbbell className="w-4 h-4" />
              Browse More Exercises
            </Button>
          </Link>
        )}
      </div>

      {/* Content Area */}
      {savedExercises.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No favorite exercises yet</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Save exercises you want to access quickly by clicking the heart icon on any exercise detail page.
          </p>
          <Link to="/exercises">
            <Button variant="primary" size="md" className="shadow-glow">
              <Dumbbell className="w-4 h-4" />
              Browse Exercises
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {savedExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <Card className="group hover:border-accent/30 transition-all flex flex-col justify-between h-full p-4">
                  <div>
                    {/* Media Preview Box */}
                    <div className="relative aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 mb-4 flex items-center justify-center overflow-hidden border border-surface-border/80">
                      <Dumbbell className="w-10 h-10 text-gray-600 group-hover:text-accent/50 transition-colors" />
                      {exercise.cover ? (
                        <img
                          src={exercise.cover}
                          alt={exercise.name}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}

                      {/* Quick Unfavorite button overlay */}
                      <button
                        onClick={(e) => handleRemoveFavorite(e, exercise.id, exercise.name)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-xs border border-white/10 text-red-400 hover:text-red-300 hover:bg-black/80 transition-all shadow-md"
                        title="Remove from Favorites"
                        aria-label={`Remove ${exercise.name} from Favorites`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Exercise Info */}
                    <div className="space-y-2">
                      <Link to={`/exercises/${exercise.id}`}>
                        <h2 className="text-base font-bold text-white group-hover:text-accent transition-colors block">
                          {exercise.name}
                        </h2>
                      </Link>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default" className="text-[11px]">
                          {exercise.category || 'Chest'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {exercise.difficulty || 'Intermediate'}
                        </span>
                      </div>

                      {exercise.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-surface-border/60 flex items-center justify-between gap-2">
                    <Link to={`/exercises/${exercise.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full text-xs font-medium justify-between">
                        <span>Open Exercise</span>
                        <ArrowRight className="w-3.5 h-3.5 text-accent" />
                      </Button>
                    </Link>

                    <button
                      onClick={(e) => handleRemoveFavorite(e, exercise.id, exercise.name)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                      title="Remove from favorites"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
