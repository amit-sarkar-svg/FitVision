import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bone, Route, Layers } from 'lucide-react'
import Card from '../UI/Card'
import ExerciseControls from './ExerciseControls'
import HumanModel from './HumanModel'
import CameraController from './CameraController'
import { ModelErrorBoundary, ModelErrorState, ModelLoadingState } from './ModelLoader'

const overlayControls = [
  { id: 'muscles', label: 'Muscles', icon: Layers },
  { id: 'skeleton', label: 'Skeleton', icon: Bone },
  { id: 'motion', label: 'Motion Path', icon: Route },
]

function ExercisePlaceholder({ mode, exerciseName }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-hover/50 via-transparent to-surface/80" />

      {/* Grid floor effect */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(57,211,83,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* Stylized exercise figure placeholder */}
      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Bench */}
          <div className="w-48 h-3 bg-gray-600 rounded-sm mb-1 shadow-lg" />
          <div className="flex justify-center gap-16 -mt-16">
            {/* Dumbbells */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-2 bg-gray-400 rounded-full" />
              <div className="w-2 h-6 bg-gray-500 rounded-sm" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-2 bg-gray-400 rounded-full" />
              <div className="w-2 h-6 bg-gray-500 rounded-sm" />
            </div>
          </div>

          {/* Body silhouette */}
          <svg viewBox="0 0 120 80" className="w-40 h-28 mx-auto" fill="none">
            <ellipse cx="60" cy="35" rx="12" ry="10" fill="#4B5563" />
            <rect x="30" y="42" width="60" height="14" rx="4" fill="#6B7280" />
            <rect x="20" y="48" width="80" height="8" rx="2" fill="#4B5563" />
            {/* Chest highlight */}
            <ellipse cx="60" cy="48" rx="18" ry="8" fill="#EF4444" opacity="0.6" />
            {/* Shoulder highlights */}
            <circle cx="35" cy="44" r="6" fill="#F97316" opacity="0.5" />
            <circle cx="85" cy="44" r="6" fill="#F97316" opacity="0.5" />
            {/* Arm/tricep */}
            <rect x="15" y="50" width="8" height="16" rx="3" fill="#6B7280" />
            <rect x="97" y="50" width="8" height="16" rx="3" fill="#6B7280" />
            <ellipse cx="19" cy="68" rx="5" ry="4" fill="#EAB308" opacity="0.5" />
            <ellipse cx="101" cy="68" rx="5" ry="4" fill="#EAB308" opacity="0.5" />
          </svg>
        </div>

        <p className="mt-4 text-xs font-medium text-gray-500 uppercase tracking-widest">
          {mode === '3d' ? '3D Exercise Viewer' : 'Real Video Player'}
        </p>
        <p className="text-sm text-gray-400 mt-1">{exerciseName}</p>
      </div>
    </div>
  )
}

function ModelCanvas({ cameraAngle }) {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 7.2], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      className="absolute inset-0"
    >
      <color attach="background" args={['#121722']} />
      <hemisphereLight args={['#dce9ff', '#182335', 1.35]} />
      <directionalLight position={[4.5, 6, 5]} intensity={2.2} color="#fff4e5" />
      <directionalLight position={[-5, 2, 3]} intensity={1.05} color="#9cbcff" />
      <directionalLight position={[1, 4, -5]} intensity={1.6} color="#86f7bd" />
      <Suspense fallback={<ModelLoadingState />}>
        <HumanModel />
      </Suspense>
      <CameraController preset={cameraAngle} />
    </Canvas>
  )
}

export default function ExerciseViewer({
  mode = '3d',
  cameraAngle,
  exerciseName,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
  viewerRef,
}) {
  const [activeOverlay, setActiveOverlay] = useState('muscles')

  return (
    <Card padding={false} className="overflow-hidden">
      <div
        ref={viewerRef}
        className="relative aspect-video bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] min-h-[280px] sm:min-h-[360px]"
      >
        {mode === '3d' ? (
          <ModelErrorBoundary fallback={<ModelErrorState />}>
            <ModelCanvas cameraAngle={cameraAngle} />
          </ModelErrorBoundary>
        ) : (
          <ExercisePlaceholder mode={mode} exerciseName={exerciseName} />
        )}

        {/* Live muscle highlight indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-surface-border">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-white">Live Muscle Highlight</span>
        </div>

        {/* Overlay controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5">
          {overlayControls.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveOverlay(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all backdrop-blur-sm border ${
                activeOverlay === id
                  ? 'bg-accent/20 border-accent/50 text-accent'
                  : 'bg-surface/70 border-surface-border text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <ExerciseControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPlayPause={onPlayPause}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onFullscreen={onFullscreen}
      />
    </Card>
  )
}
