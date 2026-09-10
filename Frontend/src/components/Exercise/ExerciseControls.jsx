import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react'
import { formatTime } from '../../utils/clsx'
import ProgressBar from '../UI/ProgressBar'

export default function ExerciseControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
  compact = false,
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`bg-surface-raised border-t border-surface-border ${compact ? 'px-4 py-3' : 'px-4 sm:px-5 py-3 sm:py-4'}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onPlayPause}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-accent text-surface hover:bg-accent-bright transition-colors shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
        </button>

        <span className="text-xs font-mono text-gray-400 w-10 shrink-0">{formatTime(currentTime)}</span>

        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1 accent-accent cursor-pointer"
            style={{
              background: `linear-gradient(to right, #39D353 ${progress}%, #2A2A2A ${progress}%)`,
            }}
          />
        </div>

        <span className="text-xs font-mono text-gray-400 w-10 shrink-0 text-right">{formatTime(duration)}</span>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle volume"
          >
            {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-16 h-1 accent-accent cursor-pointer hidden md:block"
          />
        </div>

        <button
          onClick={onFullscreen}
          className="text-gray-400 hover:text-white transition-colors shrink-0"
          aria-label="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
