import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/UI/Button'
import { useAuth } from '../context/AuthContext'
import Login, { AuthCard, Field } from './Login'

export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !password) return setError('Name, email, and password are required.')
    if (password.length < 8) return setError('Password must be at least 8 characters long.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    setSubmitting(true); setError('')
    try { await register(name, email, password); navigate('/dashboard', { replace: true }) } catch (requestError) { setError(requestError.message) } finally { setSubmitting(false) }
  }

  return <AuthCard title="Create your account" subtitle="Start building a stronger routine with FitVision.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name" value={name} onChange={setName} autoComplete="name" />
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
      <Field label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Register'}</Button>
    </form>
    <p className="mt-5 text-sm text-gray-400">Already have an account? <Link className="text-accent hover:text-accent-bright" to="/login">Login</Link></p>
  </AuthCard>
}
