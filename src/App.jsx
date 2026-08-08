import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Exercises from './pages/Exercises'

const ExerciseDetails = lazy(() => import('./pages/ExerciseDetails'))
const WorkoutPlans = lazy(() => import('./pages/WorkoutPlans'))
const DietNutrition = lazy(() => import('./pages/DietNutrition'))
const BMICalculator = lazy(() => import('./pages/BMICalculator'))
const ProgressTracker = lazy(() => import('./pages/ProgressTracker'))
const Favorites = lazy(() => import('./pages/Favorites'))
const TipsArticles = lazy(() => import('./pages/TipsArticles'))
const SettingsPage = lazy(() => import('./pages/Settings'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="exercises" element={<Exercises />} />
          <Route path="exercises/:id" element={<ExerciseDetails />} />
          <Route path="workout-plans" element={<WorkoutPlans />} />
          <Route path="diet-nutrition" element={<DietNutrition />} />
          <Route path="bmi" element={<BMICalculator />} />
          <Route path="progress" element={<ProgressTracker />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="tips" element={<TipsArticles />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
