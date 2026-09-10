import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Dumbbell,
  CalendarDays,
  Apple,
  Calculator,
  TrendingUp,
  Heart,
  BookOpen,
  Settings,
  Activity,
  X,
} from 'lucide-react'
import ProgressBar from '../UI/ProgressBar'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exercises', label: 'Exercises', icon: Dumbbell },
  { to: '/workout-plans', label: 'Workout Plans', icon: CalendarDays },
  { to: '/diet-nutrition', label: 'Diet & Nutrition', icon: Apple },
  { to: '/bmi', label: 'BMI Calculator', icon: Calculator },
  { to: '/progress', label: 'Progress Tracker', icon: TrendingUp },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/tips', label: 'Tips & Articles', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-[220px] shrink-0
          bg-surface-raised border-r border-surface-border
          flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-surface" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">FitLife</p>
              <p className="text-sm font-bold text-white leading-tight">FITVISION</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent text-surface shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-tips to-surface-card border border-tips-border p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-purple-200">Daily Goal</span>
              <span className="text-lg font-bold text-accent">70%</span>
            </div>
            <ProgressBar value={70} max={100} className="mb-3" />
            <p className="text-xs text-gray-400 mb-0.5">Workouts Completed</p>
            <p className="text-sm font-semibold text-white mb-3">3 / 5</p>
            <NavLink
              to="/progress"
              className="text-xs font-medium text-accent hover:text-accent-bright transition-colors"
            >
              View Progress →
            </NavLink>
          </motion.div>
        </div>
      </aside>
    </>
  )
}
