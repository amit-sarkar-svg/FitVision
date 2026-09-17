import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import { useAuth } from '../../context/AuthContext'
import { exerciseMediaUrl } from '../../utils/api'

export default function AdminExercises() {
  const { authorizedRequest } = useAuth()
  const [exercises, setExercises] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); authorizedRequest('/admin/exercises').then((r) => setExercises(r.data)).catch((e) => setError(e.message)).finally(() => setLoading(false)) }
  useEffect(load, [authorizedRequest])
  const remove = async (exercise) => {
    if (!window.confirm(`Delete “${exercise.name}”? This cannot be undone.`)) return
    try { await authorizedRequest(`/admin/exercises/${exercise._id}`, { method: 'DELETE' }); setExercises((items) => items.filter((item) => item._id !== exercise._id)) } catch (requestError) { setError(requestError.message) }
  }
  return <div className="p-4 lg:p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-accent font-semibold">Administration</p><h1 className="mt-1 text-2xl font-bold text-white">Exercises</h1></div><Link to="/admin/exercises/new"><Button><Plus className="w-4 h-4" /> Add Exercise</Button></Link></div>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<Card className="mt-6 overflow-x-auto" padding={false}>{loading ? <p className="p-5 text-sm text-gray-400">Loading exercises…</p> : <table className="w-full text-left text-sm"><thead className="border-b border-surface-border text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-4">Exercise</th><th className="p-4">Category</th><th className="p-4">Difficulty</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{exercises.map((exercise) => <tr key={exercise._id} className="border-b border-surface-border/60"><td className="p-4"><div className="flex items-center gap-3">{(exercise.media?.coverImage || exercise.cover) && <img className="h-10 w-14 rounded-lg object-cover" src={exerciseMediaUrl(exercise.media?.coverImage || exercise.cover)} alt="" />}<span className="font-medium text-white">{exercise.name}</span></div></td><td className="p-4 text-gray-300">{exercise.category}</td><td className="p-4 text-gray-300">{exercise.difficulty}</td><td className="p-4"><div className="flex justify-end gap-2"><Link to={`/admin/exercises/${exercise._id}/edit`}><Button size="sm" variant="secondary"><Pencil className="w-3.5 h-3.5" /> Edit</Button></Link><Button size="sm" variant="danger" onClick={() => remove(exercise)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button></div></td></tr>)}</tbody></table>}</Card></div>
}
