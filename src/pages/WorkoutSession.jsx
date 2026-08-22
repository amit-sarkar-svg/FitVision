import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Dumbbell,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Target,
  Lightbulb,
} from 'lucide-react'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Badge from '../components/UI/Badge'
import ProgressBar from '../components/UI/ProgressBar'
import { useWorkout } from '../context/WorkoutContext'

export default function WorkoutSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPlanById } = useWorkout()
  const plan = getPlanById(id)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedIndices, setCompletedIndices] = useState(new Set())
  const [isFinished, setIsFinished] = useState(false)

  if (!plan || !plan.exercises || plan.exercises.length === 0) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <Card className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">No Exercises in Plan</h2>
          <p className="text-xs text-gray-400 mb-6">Add exercises to this workout plan before starting a session.</p>
          <Link to={`/workout-plans/${id || ''}`}>
            <Button variant="primary" size="md">
              <ArrowLeft className="w-4 h-4" />
              Back to Plan
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const exercises = plan.exercises
  const totalExercises = exercises.length
  const currentExercise = exercises[currentIndex]
  const isCurrentCompleted = completedIndices.has(currentIndex)
  const progressPercent = Math.round((completedIndices.size / totalExercises) * 100)

  const handleCompleteCurrent = () => {
    const nextCompleted = new Set(completedIndices)
    nextCompleted.add(currentIndex)
    setCompletedIndices(nextCompleted)

    if (currentIndex + 1 < totalExercises) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Finished all exercises
      setIsFinished(true)
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < totalExercises) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleRestart = () => {
    setCompletedIndices(new Set())
    setCurrentIndex(0)
    setIsFinished(false)
  }

  // Workout Complete Screen
  if (isFinished) {
    return (
      <div className="p-4 lg:p-6 max-w-xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 text-center border-accent/40 shadow-glow">
            <div className="w-20 h-20 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-accent animate-bounce" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-1 inline-block">
              Great Job!
            </span>
            <h1 className="text-3xl font-extrabold text-white mb-2">Workout Complete!</h1>
            <p className="text-sm text-gray-400 mb-6">
              You crushed your <span className="text-white font-medium">{plan.name}</span> session.
            </p>

            <div className="bg-surface/80 border border-surface-border rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
              <div className="text-center border-r border-surface-border pr-2">
                <p className="text-xs text-gray-400">Exercises Completed</p>
                <p className="text-xl font-bold text-accent mt-1">
                  {completedIndices.size} / {totalExercises}
                </p>
              </div>
              <div className="text-center pl-2">
                <p className="text-xs text-gray-400">Completion Rate</p>
                <p className="text-xl font-bold text-white mt-1">{progressPercent}%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="secondary" size="md" onClick={handleRestart} className="w-full sm:w-auto">
                <RotateCcw className="w-4 h-4" />
                Restart Workout
              </Button>
              <Link to="/workout-plans" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto shadow-glow">
                  <CheckCircle2 className="w-4 h-4" />
                  Back to Workout Plans
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/workout-plans/${plan.id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Workout
        </Link>

        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">Session Progress</p>
          <p className="text-sm font-bold text-white">
            Exercise {currentIndex + 1} of {totalExercises}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <ProgressBar value={completedIndices.size} max={totalExercises} />
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
          <span>{plan.name}</span>
          <span>{progressPercent}% Completed</span>
        </div>
      </div>

      {/* Exercise Step Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id + currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 space-y-6">
            {/* Header / Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
                  Exercise {currentIndex + 1} of {totalExercises}
                </span>
                <h2 className="text-2xl font-bold text-white">{currentExercise.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">{currentExercise.category || 'Chest'}</Badge>
                <span className="text-xs text-gray-400 px-2.5 py-1 rounded-full bg-surface-hover border border-surface-border">
                  {currentExercise.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>

            {/* Exercise Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Media Preview */}
              <div className="relative aspect-video rounded-xl bg-surface-hover border border-surface-border overflow-hidden flex items-center justify-center">
                {currentExercise.cover ? (
                  <img
                    src={currentExercise.cover}
                    alt={currentExercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Dumbbell className="w-12 h-12 text-accent/50" />
                )}
                {isCurrentCompleted && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-accent font-bold text-base">
                    <CheckCircle2 className="w-6 h-6" />
                    Completed
                  </div>
                )}
              </div>

              {/* Information & Form Tips */}
              <div className="space-y-4">
                {/* Muscle targets */}
                {currentExercise.primaryMuscles?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Target className="w-3.5 h-3.5 text-accent" />
                      Target Muscles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentExercise.primaryMuscles.map((m) => (
                        <Badge key={m} variant="primary" className="text-xs">
                          {m}
                        </Badge>
                      ))}
                      {currentExercise.secondaryMuscles?.map((m) => (
                        <Badge key={m} variant="secondary" className="text-xs">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Instructions / Tips */}
                {currentExercise.tips && (
                  <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Execution Tip
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{currentExercise.tips}</p>
                  </div>
                )}

                {/* Link to 3D Viewer & full details */}
                <Link
                  to={`/exercises/${currentExercise.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Interactive 3D / Video Viewer (New Tab)
                </Link>
              </div>
            </div>

            {/* Navigation & Completion Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-border gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCompleteCurrent}
                  className="shadow-glow font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {currentIndex + 1 === totalExercises ? 'Finish Workout' : 'Complete Exercise'}
                </Button>

                {currentIndex + 1 < totalExercises && (
                  <Button variant="ghost" size="md" onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
