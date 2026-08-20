import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const ExerciseVideo = forwardRef(function ExerciseVideo(
  {
    source,
    playbackRate,
    volume,
    onPlayStateChange,
    onTimeChange,
    onDurationChange,
    onVolumeChange,
  },
  ref,
) {
  const videoRef = useRef(null)
  const hasLoadedSource = useRef(false)
  const shouldResume = useRef(true)
  const [status, setStatus] = useState('loading')

  const reportTime = () => {
    const video = videoRef.current
    if (video) onTimeChange(video.currentTime)
  }

  const attemptPlayback = () => {
    const video = videoRef.current
    if (!video || !shouldResume.current) return

    video.play().catch((error) => {
      // Muted playback is requested, but a browser or device may still decline autoplay.
      console.warn('Exercise video autoplay was blocked.', error)
      onPlayStateChange(false)
    })
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !source) return undefined

    const wasPlaying = hasLoadedSource.current ? !video.paused && !video.ended : true
    shouldResume.current = wasPlaying
    video.pause()
    setStatus('loading')
    onTimeChange(0)
    onDurationChange(0)

    // One video element is reused: releasing the old source before loading the next
    // view avoids retaining the previous video resource in memory.
    video.removeAttribute('src')
    video.load()
    video.src = source
    video.load()
    hasLoadedSource.current = true

    return undefined
  }, [source, onDurationChange, onTimeChange])

  useEffect(() => {
    const video = videoRef.current
    if (video) video.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = volume
    video.muted = volume === 0
  }, [volume])

  useEffect(() => () => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.removeAttribute('src')
    video.load()
  }, [])

  useImperativeHandle(ref, () => ({
    togglePlay() {
      const video = videoRef.current
      if (!video) return

      if (video.paused) {
        shouldResume.current = true
        attemptPlayback()
      } else {
        shouldResume.current = false
        video.pause()
      }
    },
    seek(time) {
      const video = videoRef.current
      if (!video || !Number.isFinite(time)) return

      video.currentTime = Math.max(0, Math.min(time, video.duration || time))
      reportTime()
    },
    setVolume(nextVolume) {
      const video = videoRef.current
      if (!video) return

      video.volume = nextVolume
      video.muted = nextVolume === 0
      onVolumeChange(video.muted ? 0 : video.volume)
    },
    requestFullscreen() {
      const viewer = videoRef.current?.parentElement
      if (!viewer?.requestFullscreen) return

      viewer.requestFullscreen().catch((error) => {
        console.warn('Unable to open exercise video fullscreen.', error)
      })
    },
  }), [onVolumeChange])

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        muted={volume === 0}
        playsInline
        loop
        preload="metadata"
        className={`w-full h-full object-contain transition-opacity ${status === 'error' ? 'opacity-0' : 'opacity-100'}`}
        onLoadStart={() => setStatus('loading')}
        onLoadedMetadata={(event) => {
          event.currentTarget.currentTime = 0
          onTimeChange(0)
          onDurationChange(event.currentTarget.duration)
        }}
        onCanPlay={() => {
          setStatus('ready')
          attemptPlayback()
        }}
        onPlay={() => onPlayStateChange(true)}
        onPause={() => onPlayStateChange(false)}
        onTimeUpdate={reportTime}
        onVolumeChange={(event) => onVolumeChange(event.currentTarget.muted ? 0 : event.currentTarget.volume)}
        onError={(event) => {
          setStatus('error')
          onPlayStateChange(false)
          console.error(`Exercise video failed to load: ${source}`, event.currentTarget.error)
        }}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-surface-hover/50 via-transparent to-surface/80">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Loading exercise...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-surface-hover/50 via-transparent to-surface/80">
          <p className="text-sm font-medium text-gray-400">Exercise video unavailable</p>
        </div>
      )}
    </div>
  )
})

export default ExerciseVideo
