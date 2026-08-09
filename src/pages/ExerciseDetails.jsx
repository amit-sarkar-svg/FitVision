import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { getExerciseById } from '../data/exercises'
import ExerciseHeader from '../components/Exercise/ExerciseHeader'
import ExerciseViewer from '../components/Exercise/ExerciseViewer'
import ModelSelector from '../components/Exercise/ModelSelector'
import ViewModeSelector from '../components/Exercise/ViewModeSelector'
import AnimationSpeed from '../components/Exercise/AnimationSpeed'
import CameraControls from '../components/Exercise/CameraControls'
import ExerciseTips from '../components/Exercise/ExerciseTips'
import TargetMuscles from '../components/Exercise/TargetMuscles'
import MusclesWorked from '../components/Exercise/MusclesWorked'
import RelatedExercises from '../components/Exercise/RelatedExercises'
import FullscreenViewer from '../components/Exercise/FullscreenViewer'
import Button from '../components/UI/Button'

export default function ExerciseDetails() {
  const { id } = useParams()
  const exercise = getExerciseById(id)
  const viewerRef = useRef(null)

  const [isFavorite, setIsFavorite] = useState(false)
  const [viewMode, setViewMode] = useState('3d')
  const [selectedModel, setSelectedModel] = useState('male-fitness')
  const [speed, setSpeed] = useState('1.0x')
  const [cameraAngle, setCameraAngle] = useState('front')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(6)
  const [volume, setVolume] = useState(0.8)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const duration = exercise?.duration ?? 18

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= duration) {
          setIsPlaying(false)
          return duration
        }
        return t + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(true)
  }, [])

  if (!exercise) {
    return <Navigate to="/exercises" replace />
  }

  return (
    <div className="p-4 lg:p-6">
      <ExerciseHeader
        exercise={exercise}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((f) => !f)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Main content area: viewer + controls below */}
        <div className="space-y-4 min-w-0">
          <ExerciseViewer
            mode={viewMode}
            cameraAngle={cameraAngle}
            animationSpeed={speed}
            exerciseName={exercise.name}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onPlayPause={() => setIsPlaying((p) => !p)}
            onSeek={setCurrentTime}
            onVolumeChange={setVolume}
            onFullscreen={handleFullscreen}
            viewerRef={viewerRef}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
            <ViewModeSelector mode={viewMode} onModeChange={setViewMode} />
            <AnimationSpeed speed={speed} onSpeedChange={setSpeed} />
            <CameraControls angle={cameraAngle} onAngleChange={setCameraAngle} />
            <div className="sm:col-span-2">
              <ExerciseTips tip={exercise.tips} />
            </div>
          </div>
        </div>

        {/* Right info panel - desktop */}
        <div className="hidden xl:flex flex-col gap-4">
          <TargetMuscles
            primaryMuscles={exercise.primaryMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
          />
          <MusclesWorked
            primaryMuscles={exercise.primaryMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
          />
          <RelatedExercises exercises={exercise.relatedExercises} />
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button size="lg" className="w-full">
              <Plus className="w-5 h-5" />
              Add to Workout Plan
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Info panels - mobile/tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 xl:hidden">
        <TargetMuscles
          primaryMuscles={exercise.primaryMuscles}
          secondaryMuscles={exercise.secondaryMuscles}
        />
        <MusclesWorked
          primaryMuscles={exercise.primaryMuscles}
          secondaryMuscles={exercise.secondaryMuscles}
        />
      </div>

      <div className="mt-4 xl:hidden space-y-4">
        <RelatedExercises exercises={exercise.relatedExercises} />
        <Button size="lg" className="w-full">
          <Plus className="w-5 h-5" />
          Add to Workout Plan
        </Button>
      </div>

      <FullscreenViewer
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        exercise={exercise}
        mode={viewMode}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        speed={speed}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onSeek={setCurrentTime}
        onVolumeChange={setVolume}
      />
    </div>
  )
}
