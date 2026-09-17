import { Search, Flame, Bell, Menu, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-surface-border">
      <div className="flex items-center gap-4 px-4 lg:px-6 py-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl border border-surface-border text-gray-400 hover:text-white hover:bg-surface-hover"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search exercises, workouts..."
            className="w-full bg-surface-card border border-surface-border rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-white">12 Day Streak</span>
          </div>

          <button
            className="relative p-2 rounded-xl border border-surface-border text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {user ? <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-surface-hover transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/80 to-emerald-700 flex items-center justify-center text-xs font-bold text-surface">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-white">{user.name}</span>
            <button onClick={logout} className="p-1 text-gray-400 hover:text-white" title="Logout" aria-label="Logout"><LogOut className="w-4 h-4" /></button>
          </div> : <Link to="/login" className="rounded-xl border border-surface-border px-3 py-2 text-sm font-medium text-white hover:border-accent hover:text-accent">Login</Link>}
        </div>
      </div>
    </header>
  )
}
