import { useState, useEffect } from "react";
import Card from "../UI/Card";
import { muscleLabels } from "../../data/exercises";
import { clsx } from "../../utils/clsx";
import { exerciseMediaUrl } from "../../utils/api";

function TargetMuscleImage({ imagePath }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imagePath]);

  if (imageError) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-surface rounded-lg">
        <p className="text-xs text-gray-400">Target muscle image unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-surface rounded-lg overflow-hidden">
      <img
        src={imagePath}
        alt="Target muscles"
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export default function TargetMuscles({
  primaryMuscles,
  secondaryMuscles,
  exerciseId,
  targetMusclesImage,
}) {
  const [tab, setTab] = useState("primary");

  const legendMuscles = tab === "primary" ? primaryMuscles : secondaryMuscles;
  const imagePath = targetMusclesImage
    ? exerciseMediaUrl(targetMusclesImage)
    : `/images/target-muscles/${exerciseId}.png`;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Target Muscles</h3>
        <div className="flex gap-1 p-0.5 bg-surface rounded-lg">
          {["primary", "secondary"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded-md capitalize transition-all",
                tab === t
                  ? "bg-accent text-surface"
                  : "text-gray-400 hover:text-white",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <TargetMuscleImage imagePath={imagePath} />
      </div>

      <div className="space-y-2">
        {legendMuscles.map((muscle) => {
          const info = muscleLabels[muscle];
          const color =
            info?.type === "primary"
              ? "bg-muscle-primary"
              : info?.type === "secondary"
                ? "bg-muscle-secondary"
                : "bg-muscle-tertiary";
          return (
            <div key={muscle} className="flex items-center gap-2">
              <span
                className={clsx("w-2.5 h-2.5 rounded-full shrink-0", color)}
              />
              <span className="text-xs text-gray-300">
                {info?.label || muscle}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
