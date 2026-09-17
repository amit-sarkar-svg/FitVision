import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, ArrowRight } from 'lucide-react'
import Card from '../components/UI/Card'
import Badge from '../components/UI/Badge'
import { apiRequest, exerciseMediaUrl } from '../utils/api'

export default function Exercises() {
  const [exercises, setExercises] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { apiRequest('/exercises').then((response) => setExercises(response.data)).catch((requestError) => setError(requestError.message)) }, [])
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Exercises</h1>
        <p className="text-sm text-gray-400">
          Browse and learn exercises with interactive 3D visualization.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/exercises/${exercise._id}`}>
              <Card className="group hover:border-accent/30 transition-all cursor-pointer h-full">
                <div className="relative aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 mb-4 flex items-center justify-center overflow-hidden">
                  <Dumbbell className="w-10 h-10 text-gray-600 group-hover:text-accent/50 transition-colors" />
                  {exercise.cover ? (
                    <img
                      src={exerciseMediaUrl(exercise.media?.coverImage || exercise.cover)}
                      alt=""
                      aria-hidden="true"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                      {exercise.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{exercise.category}</Badge>
                      <span className="text-xs text-gray-500">
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-accent transition-colors shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {!error && exercises.length === 0 && <p className="mt-4 text-sm text-gray-400">No exercises are available yet.</p>}
    </div>
  );
}
