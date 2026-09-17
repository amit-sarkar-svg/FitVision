import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Exercises from './pages/Exercises'
import { WorkoutProvider } from './context/WorkoutContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

const ExerciseDetails = lazy(() => import('./pages/ExerciseDetails'))
const WorkoutPlans = lazy(() => import('./pages/WorkoutPlans'))
const WorkoutPlanDetails = lazy(() => import('./pages/WorkoutPlanDetails'))
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'))
const DietNutrition = lazy(() => import('./pages/DietNutrition'))
const BMICalculator = lazy(() => import('./pages/BMICalculator'))
const ProgressTracker = lazy(() => import('./pages/ProgressTracker'))
const Favorites = lazy(() => import('./pages/Favorites'))
const TipsArticles = lazy(() => import('./pages/TipsArticles'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminExercises = lazy(() => import('./pages/admin/AdminExercises'))
const ExerciseForm = lazy(() => import('./pages/admin/ExerciseForm'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
    <WorkoutProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="exercises/:id" element={<ExerciseDetails />} />
            <Route path="workout-plans" element={<ProtectedRoute><WorkoutPlans /></ProtectedRoute>} />
            <Route path="workout-plans/:id" element={<ProtectedRoute><WorkoutPlanDetails /></ProtectedRoute>} />
            <Route path="workout-plans/:id/session" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />
            <Route path="diet-nutrition" element={<DietNutrition />} />
            <Route path="bmi" element={<BMICalculator />} />
            <Route path="progress" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
            <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="tips" element={<TipsArticles />} />
            <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/exercises" element={<ProtectedRoute admin><AdminExercises /></ProtectedRoute>} />
            <Route path="admin/exercises/new" element={<ProtectedRoute admin><ExerciseForm /></ProtectedRoute>} />
            <Route path="admin/exercises/:id/edit" element={<ProtectedRoute admin><ExerciseForm /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute admin><AdminUsers /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </WorkoutProvider>
    </AuthProvider>
  )
}
