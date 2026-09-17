import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Badge from '../components/UI/Badge'
import { useWorkout } from '../context/WorkoutContext'
import {
  getWorkoutStatistics,
  getWeeklyActivity,
  formatWorkoutDate,
  formatWorkoutDateTime,
} from '../utils/workoutHistory'

export default function ProgressTracker() {
  const {
    history,
    historyLoading,
    historyError,
    progress,
    progressLoading,
    progressError,
    reloadHistory,
  } = useWorkout()
  const [showAll, setShowAll] = useState(false)

  // Compute statistics & weekly activity from backend progress or fallback
  const stats = useMemo(() => {
    if (progress && progress.stats) {
      return progress.stats
    }
    return getWorkoutStatistics(history)
  }, [progress, history])

  const weeklyActivity = useMemo(() => {
    if (progress && progress.weeklyActivity && progress.weeklyActivity.length === 7) {
      return progress.weeklyActivity
    }
    return getWeeklyActivity(history)
  }, [progress, history])

  const visibleHistory = useMemo(() => {
    if (showAll) return history
    return history.slice(0, 5)
  }, [history, showAll])

  const isLoading = (progressLoading || historyLoading) && history.length === 0
  const errorMessage = progressError || historyError

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-6xl mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Loading your progress & workout history…</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
          </div>
          <p className="text-sm text-gray-400">
            Track your workout consistency, total exercises, and routine milestones.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <Link to="/workout-plans">
              <Button variant="primary" size="md" className="shadow-glow">
                <Dumbbell className="w-4 h-4" />
                Start a Workout
              </Button>
            </Link>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl flex items-center justify-between">
          <p className="text-sm">{errorMessage}</p>
          <Button variant="secondary" size="sm" onClick={() => reloadHistory()}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Content: If no history, show empty state */}
      {history.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No workout history yet</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Complete your first workout session to start tracking your progress and weekly activity.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/exercises">
              <Button variant="secondary" size="md">
                Browse Exercises
              </Button>
            </Link>
            <Link to="/workout-plans">
              <Button variant="primary" size="md" className="shadow-glow">
                <Dumbbell className="w-4 h-4" />
                View Workout Plans
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Workouts */}
            <Card className="p-5 flex items-center justify-between border-surface-border hover:border-accent/30 transition-all">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Workouts Completed
                </p>
                <p className="text-3xl font-extrabold text-white">{stats.totalWorkouts}</p>
                <p className="text-[11px] text-accent font-medium">All-time finished sessions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <Award className="w-6 h-6" />
              </div>
            </Card>

            {/* Total Exercises */}
            <Card className="p-5 flex items-center justify-between border-surface-border hover:border-accent/30 transition-all">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Exercises Completed
                </p>
                <p className="text-3xl font-extrabold text-white">{stats.totalExercises}</p>
                <p className="text-[11px] text-gray-400 font-medium">Total exercise sets crushed</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
            </Card>

            {/* Workouts This Week */}
            <Card className="p-5 flex items-center justify-between border-surface-border hover:border-accent/30 transition-all">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  This Week
                </p>
                <p className="text-3xl font-extrabold text-accent">
                  {stats.workoutsThisWeek}{' '}
                  <span className="text-sm font-normal text-gray-400">
                    {stats.workoutsThisWeek === 1 ? 'workout' : 'workouts'}
                  </span>
                </p>
                <p className="text-[11px] text-gray-400 font-medium">Current calendar week</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
            </Card>
          </div>

          {/* Weekly Activity Section */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  Weekly Activity
                </h2>
                <p className="text-xs text-gray-400">
                  Consistency overview for Monday through Sunday
                </p>
              </div>
              <Badge variant="default" className="text-xs self-start sm:self-auto">
                {stats.workoutsThisWeek} {stats.workoutsThisWeek === 1 ? 'day active' : 'days active'} this week
              </Badge>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
              {weeklyActivity.map((day) => (
                <div
                  key={day.dayName}
                  className={`flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl border transition-all ${
                    day.isToday
                      ? 'border-accent bg-accent/5'
                      : day.hasWorkout
                      ? 'border-surface-border bg-surface-card hover:border-accent/40'
                      : 'border-surface-border/60 bg-surface/40'
                  }`}
                >
                  <span
                    className={`text-[11px] sm:text-xs font-semibold mb-1 ${
                      day.isToday ? 'text-accent' : 'text-gray-400'
                    }`}
                  >
                    {day.dayName}
                  </span>

                  {/* Activity Indicator Node */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold my-1 transition-all ${
                      day.hasWorkout
                        ? 'bg-accent text-surface shadow-glow'
                        : 'text-gray-600'
                    }`}
                  >
                    {day.hasWorkout ? (
                      <CheckCircle2 className="w-4 h-4 fill-current text-surface" />
                    ) : (
                      <span className="text-gray-600 text-sm">—</span>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-500 mt-1 hidden sm:block">
                    {day.dateFormatted}
                  </span>

                  {day.isToday && (
                    <span className="text-[9px] font-bold text-accent uppercase tracking-wider mt-0.5">
                      Today
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Workouts List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-accent" />
                Recent Workouts
              </h2>
              {history.length > 5 && (
                <button
                  onClick={() => setShowAll((prev) => !prev)}
                  className="text-xs font-semibold text-accent hover:text-accent-bright transition-colors"
                >
                  {showAll ? 'Show Latest 5' : `View All (${history.length})`}
                </button>
              )}
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {visibleHistory.map((workout, index) => (
                  <motion.div
                    key={workout.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <Card className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-accent/30 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Icon Badge */}
                        <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white truncate">
                              {workout.planName}
                            </h3>
                            <Badge variant="primary" className="text-[10px] py-0 px-2 shrink-0">
                              Completed
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              {formatWorkoutDate(workout.completedAt)}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-300 font-medium">
                              {workout.exercisesCompleted} / {workout.totalExercises || workout.exercisesCompleted} {workout.totalExercises === 1 ? 'Exercise' : 'Exercises'}
                            </span>
                            {workout.duration > 0 && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="flex items-center gap-1 text-gray-400">
                                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                                  {Math.floor(workout.duration / 60)}m {workout.duration % 60}s
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border/60">
                        <Link to={`/workout-plans/${workout.planId || ''}`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            View Routine
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
