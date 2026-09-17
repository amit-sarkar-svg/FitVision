import { Link } from 'react-router-dom'
import { Dumbbell, Plus, Users } from 'lucide-react'
import Card from '../../components/UI/Card'

const actions = [
  { to: '/admin/exercises', label: 'Exercises', description: 'Manage the published exercise library.', icon: Dumbbell },
  { to: '/admin/exercises/new', label: 'Add Exercise', description: 'Create a data-driven exercise with local media.', icon: Plus },
  { to: '/admin/users', label: 'Users', description: 'View registered accounts and their roles.', icon: Users },
]

export default function AdminDashboard() {
  return <div className="p-4 lg:p-6"><p className="text-xs uppercase tracking-widest text-accent font-semibold">Administration</p><h1 className="mt-1 text-2xl font-bold text-white">Admin Dashboard</h1><p className="mt-1 text-sm text-gray-400">Manage FitVision content and accounts.</p><div className="mt-6 grid gap-4 md:grid-cols-3">{actions.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to}><Card className="h-full hover:border-accent/50 transition-colors"><Icon className="w-6 h-6 text-accent" /><h2 className="mt-4 font-semibold text-white">{label}</h2><p className="mt-1 text-sm text-gray-400">{description}</p></Card></Link>)}</div></div>
}
