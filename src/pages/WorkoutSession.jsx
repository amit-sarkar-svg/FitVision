import { useState, useRef, useCallback, useEffect } from 'react'
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
  Check,
} from 'lucide-react'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import Badge from '../components/UI/Badge'
import ProgressBar from '../components/UI/ProgressBar'
import ExerciseViewer from '../components/Exercise/ExerciseViewer'
import CameraControls from '../components/Exercise/CameraControls'
import TargetMuscles from '../components/Exercise/TargetMuscles'
import MusclesWorked from '../components/Exercise/MusclesWorked'
import ExitWorkoutModal from '../components/Workout/ExitWorkoutModal'
import { useWorkout } from '../context/WorkoutContext'
import { getExerciseById } from '../data/exercises'

const exerciseVideoSources = {
  'dumbbell-bench-press': {
    front: '/videos/exercises/dumbbell-bench-press/front.mp4',
    side: '/videos/exercises/dumbbell-bench-press/side.mp4',
    top: '/videos/exercises/dumbbell-bench-press/top.mp4',
  },
}

export default function WorkoutSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPlanById } = useWorkout()
  const plan = getPlanById(id)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedIndices, setCompletedIndices] = useState(new Set())
  const [isFinished, setIsFinished] = useState(false)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  // Video & viewer player state
  const [cameraAngle, setCameraAngle] = useState('front')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0)
  const viewerRef = useRef(null)
  const videoRef = useRef(null)

  const handleFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen()
  }, [])

  // Reset camera angle to front when moving to a different exercise
  useEffect(() => {
    setCameraAngle('front')
    setIsPlaying(false)
    setCurrentTime(0)
  }, [currentIndex])

  if (!plan || !plan.exercises || plan.exercises.length === 0) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <Card className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">No Exercises in Plan</h2>
          <p className="text-xs text-gray-400 mb-6">
            Add exercises to this workout plan before starting a workout session.
          </p>
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
  const currentPlanExercise = exercises[currentIndex]

  // Merge with full exercise dataset if available
  const fullExerciseData = getExerciseById(currentPlanExercise.id)
  const currentExercise = {
    ...currentPlanExercise,
    ...(fullExerciseData || {}),
    primaryMuscles:
      fullExerciseData?.primaryMuscles || currentPlanExercise.primaryMuscles || ['Pectoralis Major'],
    secondaryMuscles:
      fullExerciseData?.secondaryMuscles ||
      currentPlanExercise.secondaryMuscles || ['Anterior Deltoid', 'Triceps Brachii'],
  }

  const isCurrentCompleted = completedIndices.has(currentIndex)
  const isLastExercise = currentIndex === totalExercises - 1
  const allExercisesCompleted = completedIndices.size === totalExercises

  // Determine video availability
  const hasExerciseVideo = Boolean(exerciseVideoSources[currentExercise.id])
  const currentVideoSource = hasExerciseVideo
    ? exerciseVideoSources[currentExercise.id][cameraAngle]
    : undefined

  const handleCompleteCurrent = () => {
    const nextCompleted = new Set(completedIndices)
    nextCompleted.add(currentIndex)
    setCompletedIndices(nextCompleted)

    if (!isLastExercise) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  const handleNext = () => {
    if (!isLastExercise) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleRestart = () => {
    setCompletedIndices(new Set())
    setCurrentIndex(0)
    setIsFinished(false)
    setCameraAngle('front')
  }

  const handleExitClick = () => {
    if (completedIndices.size < totalExercises && !isFinished) {
      setIsExitModalOpen(true)
    } else {
      navigate(`/workout-plans/${plan.id}`)
    }
  }

  const confirmExit = () => {
    setIsExitModalOpen(false)
    navigate(`/workout-plans/${plan.id}`)
  }

  // Workout Complete Celebration Screen
  if (isFinished) {
    return (
      <div className="p-4 lg:p-6 max-w-xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="p-8 text-center border-accent/40 shadow-glow">
            <div className="w-20 h-20 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-10 h-10 text-accent animate-bounce" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-1 inline-block">
              Great work!
            </span>
            <h1 className="text-3xl font-extrabold text-white mb-2">Workout Complete! 🎉</h1>
            <p className="text-sm text-gray-300 mb-6 font-medium">
              {plan.name}
            </p>

            <div className="bg-surface/80 border border-surface-border rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
              <div className="text-center border-r border-surface-border pr-2">
                <p className="text-xs text-gray-400">Exercises Completed</p>
                <p className="text-xl font-bold text-accent mt-1 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  {completedIndices.size} / {totalExercises}
                </p>
              </div>
              <div className="text-center pl-2">
                <p className="text-xs text-gray-400">Completion Status</p>
                <p className="text-xl font-bold text-white mt-1">100%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleRestart}
                className="w-full sm:w-auto"
              >
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
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Bar / Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-border/50">
        <button
          onClick={handleExitClick}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Workout
        </button>

        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-xs font-semibold">
            {plan.name}
          </Badge>
          <span className="text-xs font-bold text-gray-300">
            Exercise {currentIndex + 1} of {totalExercises}
          </span>
        </div>
      </div>

      {/* Progress Section: Visual Step Dots + Progress Bar */}
      <div className="space-y-3 bg-surface-card/60 border border-surface-border rounded-2xl p-4">
        {/* Step dots line */}
        <div className="flex items-center justify-between relative px-2">
          {exercises.map((ex, idx) => {
            const isCompleted = completedIndices.has(idx)
            const isCurrent = idx === currentIndex
            return (
              <div key={ex.id || idx} className="flex items-center flex-1 last:flex-none">
                {/* Step node */}
                <button
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-accent text-surface shadow-glow'
                      : isCurrent
                      ? 'bg-surface-hover border-2 border-accent text-accent'
                      : 'bg-surface border border-surface-border text-gray-500 hover:text-gray-300'
                  }`}
                  title={`${ex.name} (Step ${idx + 1})`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </button>

                {/* Connecting Line between dots */}
                {idx < totalExercises - 1 && (
                  <div className="flex-1 mx-2 h-0.5 bg-surface-border overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        completedIndices.has(idx) ? 'bg-accent' : 'bg-transparent'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress summary bar */}
        <div className="pt-1">
          <ProgressBar value={completedIndices.size} max={totalExercises} />
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5 px-1">
            <span>
              {completedIndices.size} of {totalExercises} exercises completed
            </span>
            <span className="font-semibold text-accent">
              {Math.round((completedIndices.size / totalExercises) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Exercise Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id + currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Exercise Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card border border-surface-border rounded-2xl p-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Exercise {currentIndex + 1} of {totalExercises}
                </span>
                {isCurrentCompleted && (
                  <Badge variant="primary" className="text-[10px] py-0 px-2">
                    ✓ Completed
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{currentExercise.name}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="default">{currentExercise.category || 'Chest'}</Badge>
              <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-surface-hover border border-surface-border">
                {currentExercise.difficulty || 'Intermediate'}
              </span>
            </div>
          </div>

          {/* Exercise Viewer & Panels Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
            {/* Left Area: Exercise Video Viewer + Camera Controls */}
            <div className="space-y-4 min-w-0">
              <ExerciseViewer
                mode={hasExerciseVideo ? 'video' : '3d'}
                cameraAngle={cameraAngle}
                animationSpeed="1.0x"
                exerciseName={currentExercise.name}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                onPlayPause={() => videoRef.current?.togglePlay()}
                onSeek={(time) => videoRef.current?.seek(time)}
                onVolumeChange={(nextVolume) => videoRef.current?.setVolume(nextVolume)}
                onFullscreen={handleFullscreen}
                viewerRef={viewerRef}
                videoRef={videoRef}
                videoSource={currentVideoSource}
                videoPlaybackRate={1.0}
                onVideoPlayStateChange={setIsPlaying}
                onVideoTimeChange={setCurrentTime}
                onVideoDurationChange={setDuration}
                onVideoVolumeChange={setVolume}
              />

              {/* Camera Angle selection & Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CameraControls angle={cameraAngle} onAngleChange={setCameraAngle} />

                {currentExercise.tips ? (
                  <Card className="flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-white mb-2">Form & Execution Tip</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{currentExercise.tips}</p>
                  </Card>
                ) : (
                  <Card className="flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-white mb-2">Recommended Reps</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      3 sets of 8–12 controlled repetitions. Focus on controlled eccentric phase.
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Area: Target Muscles & Muscles Worked (Desktop) */}
            <div className="hidden xl:flex flex-col gap-4">
              <TargetMuscles
                primaryMuscles={currentExercise.primaryMuscles}
                secondaryMuscles={currentExercise.secondaryMuscles}
                exerciseId={currentExercise.id}
              />
              <MusclesWorked
                primaryMuscles={currentExercise.primaryMuscles}
                secondaryMuscles={currentExercise.secondaryMuscles}
              />
            </div>
          </div>

          {/* Muscle info on mobile/tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            <TargetMuscles
              primaryMuscles={currentExercise.primaryMuscles}
              secondaryMuscles={currentExercise.secondaryMuscles}
              exerciseId={currentExercise.id}
            />
            <MusclesWorked
              primaryMuscles={currentExercise.primaryMuscles}
              secondaryMuscles={currentExercise.secondaryMuscles}
            />
          </div>

          {/* Navigation & Action Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="secondary"
              size="md"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={handleCompleteCurrent}
                className="w-full sm:w-auto shadow-glow font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isLastExercise ? 'Finish Workout' : 'Complete Exercise'}
              </Button>

              {!isLastExercise && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleNext}
                  className="w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <ExitWorkoutModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={confirmExit}
        planName={plan.name}
      />
    </div>
  )
}
