import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    if (!email.trim() || !password) return setError('Email and password are required.')
    setSubmitting(true); setError('')
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally { setSubmitting(false) }
  }

  return <AuthCard title="Welcome back" subtitle="Log in to continue your FitVision journey.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Logging in…' : 'Login'}</Button>
    </form>
    <p className="mt-5 text-sm text-gray-400">New to FitVision? <Link className="text-accent hover:text-accent-bright" to="/register">Create an account</Link></p>
  </AuthCard>
}

export function AuthCard({ title, subtitle, children }) {
  return <main className="min-h-screen bg-surface flex items-center justify-center p-4"><Card className="w-full max-w-md p-7 sm:p-8"><p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">FitVision</p><h1 className="text-2xl font-bold text-white">{title}</h1><p className="mt-2 text-sm text-gray-400">{subtitle}</p><div className="mt-6">{children}</div></Card></main>
}

export function Field({ label, type = 'text', value, onChange, ...props }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent" {...props} /></label>
}
