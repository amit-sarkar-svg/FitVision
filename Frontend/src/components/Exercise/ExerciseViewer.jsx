import Card from '../UI/Card'
import ExerciseControls from './ExerciseControls'
import ExerciseVideo from './ExerciseVideo'
import { Dumbbell } from 'lucide-react'

function ExercisePlaceholder({ exerciseName }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center mb-3">
        <Dumbbell className="w-8 h-8 text-accent/70" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
        Exercise Video
      </p>
      <p className="text-sm font-medium text-white max-w-sm truncate">{exerciseName || 'No video available'}</p>
      <p className="text-xs text-gray-500 mt-1">Video demonstration will display when available.</p>
    </div>
  )
}

export default function ExerciseViewer({
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
  videoRef,
  videoSource,
  videoPlaybackRate,
  onVideoPlayStateChange,
  onVideoTimeChange,
  onVideoDurationChange,
  onVideoVolumeChange,
}) {
  return (
    <Card padding={false} className="overflow-hidden">
      <div
        ref={viewerRef}
        className="relative aspect-video bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] min-h-[280px] sm:min-h-[360px]"
      >
        {videoSource ? (
          <ExerciseVideo
            ref={videoRef}
            source={videoSource}
            playbackRate={videoPlaybackRate}
            volume={volume}
            onPlayStateChange={onVideoPlayStateChange}
            onTimeChange={onVideoTimeChange}
            onDurationChange={onVideoDurationChange}
            onVolumeChange={onVideoVolumeChange}
          />
        ) : (
          <ExercisePlaceholder exerciseName={exerciseName} />
        )}
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
