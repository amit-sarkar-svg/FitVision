import { useEffect, useState } from 'react'
import Card from '../../components/UI/Card'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { authorizedRequest } = useAuth(); const [users, setUsers] = useState([]); const [error, setError] = useState('')
  useEffect(() => { authorizedRequest('/admin/users').then((response) => setUsers(response.data)).catch((requestError) => setError(requestError.message)) }, [authorizedRequest])
  return <div className="p-4 lg:p-6"><p className="text-xs uppercase tracking-widest text-accent font-semibold">Administration</p><h1 className="mt-1 text-2xl font-bold text-white">Users</h1>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<Card className="mt-6 overflow-x-auto" padding={false}><table className="w-full text-left text-sm"><thead className="border-b border-surface-border text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Created</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-surface-border/60"><td className="p-4 font-medium text-white">{user.name}</td><td className="p-4 text-gray-300">{user.email}</td><td className="p-4 capitalize text-accent">{user.role}</td><td className="p-4 text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></Card></div>
}
