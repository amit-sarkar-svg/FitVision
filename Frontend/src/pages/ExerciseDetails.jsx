import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { apiRequest, exerciseMediaUrl } from "../utils/api";
import ExerciseHeader from "../components/Exercise/ExerciseHeader";
import ExerciseViewer from "../components/Exercise/ExerciseViewer";
import ModelSelector from "../components/Exercise/ModelSelector";
import AnimationSpeed from "../components/Exercise/AnimationSpeed";
import CameraControls from "../components/Exercise/CameraControls";
import ExerciseTips from "../components/Exercise/ExerciseTips";
import TargetMuscles from "../components/Exercise/TargetMuscles";
import MusclesWorked from "../components/Exercise/MusclesWorked";
import RelatedExercises from "../components/Exercise/RelatedExercises";
import Button from "../components/UI/Button";
import AddToPlanModal from "../components/Workout/AddToPlanModal";
import { useWorkout } from "../context/WorkoutContext";

export default function ExerciseDetails() {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);
  const [loadError, setLoadError] = useState('');
  const { isFavorite: checkIsFavorite, toggleFavorite, showToast } = useWorkout();
  const isFavorite = checkIsFavorite(exercise?._id) || checkIsFavorite(exercise?.id);

  const hasExerciseVideo = Boolean(exercise?.media?.videos?.front);
  const viewerRef = useRef(null);
  const videoRef = useRef(null);

  const [isAddToPlanOpen, setIsAddToPlanOpen] = useState(false);
  const [viewMode, setViewMode] = useState("3d");
  const [selectedModel, setSelectedModel] = useState("male-fitness");
  const [speed, setSpeed] = useState("1.0x");
  const [cameraAngle, setCameraAngle] = useState("front");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    setExercise(null); setLoadError('');
    apiRequest(`/exercises/${id}`).then((response) => {
      setExercise(response.data);
      setViewMode(response.data.media?.videos?.front ? 'video' : '3d');
    }).catch((error) => setLoadError(error.message));
  }, [id]);

  const handleFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen();
  }, []);

  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleToggleFavorite = async () => {
    if (!exercise || isTogglingFavorite) return;
    setIsTogglingFavorite(true);
    const exerciseId = exercise._id || exercise.id;
    const res = await toggleFavorite(exerciseId);
    setIsTogglingFavorite(false);
    if (res.success) {
      showToast(
        res.isFavorite
          ? `Added "${exercise.name}" to Favorites`
          : `Removed "${exercise.name}" from Favorites`,
        'success'
      );
    } else {
      showToast(res.error || 'Failed to update favorites', 'error');
    }
  };

  if (loadError) return <div className="p-6"><p className="text-sm text-red-400">{loadError}</p><Link to="/exercises" className="mt-3 inline-block text-sm text-accent">Back to exercises</Link></div>;
  if (!exercise) return <div className="p-6 text-sm text-gray-400">Loading exercise…</div>;

  return (
    <div className="p-4 lg:p-6">
      <ExerciseHeader
        exercise={exercise}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onAddToPlan={() => setIsAddToPlanOpen(true)}
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
            onPlayPause={() => videoRef.current?.togglePlay()}
            onSeek={(time) => videoRef.current?.seek(time)}
            onVolumeChange={(nextVolume) =>
              videoRef.current?.setVolume(nextVolume)
            }
            onFullscreen={handleFullscreen}
            viewerRef={viewerRef}
            videoRef={videoRef}
            videoSource={
              hasExerciseVideo ? exerciseMediaUrl(exercise.media.videos[cameraAngle] || exercise.media.videos.front) : undefined
            }
            videoPlaybackRate={Number.parseFloat(speed)}
            onVideoPlayStateChange={setIsPlaying}
            onVideoTimeChange={setCurrentTime}
            onVideoDurationChange={setDuration}
            onVideoVolumeChange={setVolume}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
              <AnimationSpeed speed={speed} onSpeedChange={setSpeed} />
              <ExerciseTips tip={exercise.tips} />
            </div>
            <CameraControls
              angle={cameraAngle}
              onAngleChange={setCameraAngle}
            />
          </div>
        </div>

        {/* Right info panel - desktop */}
        <div className="hidden xl:flex flex-col gap-4">
          <TargetMuscles
            primaryMuscles={exercise.primaryMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
            exerciseId={exercise.id || id}
            targetMusclesImage={exercise.media?.targetMusclesImage}
          />
          <MusclesWorked
            primaryMuscles={exercise.primaryMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
          />
          <RelatedExercises exercises={exercise.relatedExercises || []} />
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button size="lg" className="w-full" onClick={() => setIsAddToPlanOpen(true)}>
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
          exerciseId={exercise.id || id}
          targetMusclesImage={exercise.media?.targetMusclesImage}
        />
        <MusclesWorked
          primaryMuscles={exercise.primaryMuscles}
          secondaryMuscles={exercise.secondaryMuscles}
        />
      </div>

      <div className="mt-4 xl:hidden space-y-4">
        <RelatedExercises exercises={exercise.relatedExercises || []} />
        <Button size="lg" className="w-full" onClick={() => setIsAddToPlanOpen(true)}>
          <Plus className="w-5 h-5" />
          Add to Workout Plan
        </Button>
      </div>

      {/* Add to Workout Plan Modal */}
      <AddToPlanModal
        isOpen={isAddToPlanOpen}
        onClose={() => setIsAddToPlanOpen(false)}
        exercise={exercise}
      />
    </div>
  );
}
