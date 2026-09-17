import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import { useAuth } from '../../context/AuthContext'

const DRAFT_KEY = 'fitvision_admin_exercise_draft'

const blank = {
  name: '',
  description: '',
  category: '',
  difficulty: '',
  equipment: '',
  primaryMuscles: '',
  secondaryMuscles: '',
  instructions: '',
  tips: '',
  duration: '18',
}

const asLines = (items) => (items || []).join('\n')

const getInitialForm = (isEditing) => {
  if (isEditing) return blank
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    return saved ? { ...blank, ...JSON.parse(saved) } : blank
  } catch {
    return blank
  }
}

export default function ExerciseForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { authorizedRequest } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(() => getInitialForm(editing))
  const [files, setFiles] = useState({})
  const [loading, setLoading] = useState(editing)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [media, setMedia] = useState(null)

  const isSubmittedRef = useRef(false)

  useEffect(() => {
    isSubmittedRef.current = false
    if (editing) {
      setLoading(true)
      authorizedRequest('/admin/exercises')
        .then((response) => {
          const exercise = response.data.find((item) => item._id === id)
          if (!exercise) throw new Error('Exercise not found.')
          setForm({
            name: exercise.name || '',
            description: exercise.description || '',
            category: exercise.category || '',
            difficulty: exercise.difficulty || '',
            equipment: exercise.equipment || '',
            primaryMuscles: asLines(exercise.primaryMuscles),
            secondaryMuscles: asLines(exercise.secondaryMuscles),
            instructions: asLines(exercise.instructions),
            tips: exercise.tips || '',
            duration: String(exercise.duration || 18),
          })
          setMedia(exercise.media)
        })
        .catch((requestError) => setError(requestError.message))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
      setMedia(null)
      setForm(getInitialForm(false))
    }
  }, [authorizedRequest, editing, id])

  // Debounced auto-save to localStorage when in Add mode
  useEffect(() => {
    if (editing || loading) return
    const timeoutId = setTimeout(() => {
      if (isSubmittedRef.current) return
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      } catch (e) {
        console.error('Failed to save draft to localStorage:', e)
      }
    }, 250)
    return () => clearTimeout(timeoutId)
  }, [form, editing, loading])

  // Save on page unload or unmount navigation when in Add mode
  useEffect(() => {
    if (editing || loading) return
    const handleBeforeUnload = () => {
      if (isSubmittedRef.current) return
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      } catch {}
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (!isSubmittedRef.current) {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
        } catch {}
      }
    }
  }, [form, editing, loading])

  const change = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const fileChange = (field) => (event) =>
    setFiles((current) => ({ ...current, [field]: event.target.files[0] }))

  const submit = async (event) => {
    event.preventDefault()
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      !form.difficulty.trim()
    ) {
      return setError('Name, description, category, and difficulty are required.')
    }

    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    Object.entries(files).forEach(([key, value]) => value && payload.append(key, value))

    setSubmitting(true)
    setError('')

    try {
      await authorizedRequest(editing ? `/admin/exercises/${id}` : '/admin/exercises', {
        method: editing ? 'PUT' : 'POST',
        body: payload,
      })
      if (!editing) {
        isSubmittedRef.current = true
        localStorage.removeItem(DRAFT_KEY)
      }
      navigate('/admin/exercises')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading exercise…</div>

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <Link className="text-sm text-accent hover:text-accent-bright" to="/admin/exercises">
        ← Back to exercises
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">
        {editing ? 'Edit Exercise' : 'Add Exercise'}
      </h1>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <Card className="grid gap-4 md:grid-cols-2">
          <Text label="Exercise Name" value={form.name} onChange={change('name')} />
          <Text
            label="Category"
            value={form.category}
            onChange={change('category')}
            placeholder="e.g. Chest"
          />
          <Select label="Difficulty" value={form.difficulty} onChange={change('difficulty')} />
          <Text
            label="Equipment"
            value={form.equipment}
            onChange={change('equipment')}
            placeholder="e.g. Dumbbells, bench"
          />
          <Area
            label="Description"
            value={form.description}
            onChange={change('description')}
            className="md:col-span-2"
          />
          <Area
            label="Primary target muscles (one per line)"
            value={form.primaryMuscles}
            onChange={change('primaryMuscles')}
          />
          <Area
            label="Secondary target muscles (one per line)"
            value={form.secondaryMuscles}
            onChange={change('secondaryMuscles')}
          />
          <Area
            label="Instructions (one ordered step per line)"
            value={form.instructions}
            onChange={change('instructions')}
            className="md:col-span-2"
          />
          <Area label="Tip" value={form.tips} onChange={change('tips')} />
          <Text
            label="Duration (seconds)"
            type="number"
            min="1"
            value={form.duration}
            onChange={change('duration')}
          />
        </Card>

        <Card>
          <h2 className="font-semibold text-white">Media</h2>
          <p className="mt-1 text-sm text-gray-400">
            Leave a file empty to keep existing media when editing.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <File
              label="Cover Image"
              accept="image/jpeg,image/png,image/webp"
              onChange={fileChange('coverImage')}
              current={media?.coverImage}
            />
            <File
              label="Target Muscles Image"
              accept="image/jpeg,image/png,image/webp"
              onChange={fileChange('targetMusclesImage')}
              current={media?.targetMusclesImage}
            />
            <File
              label="Front View Video"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={fileChange('frontVideo')}
              current={media?.videos?.front}
            />
            <File
              label="Side View Video"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={fileChange('sideVideo')}
              current={media?.videos?.side}
            />
            <File
              label="Top View Video"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={fileChange('topVideo')}
              current={media?.videos?.top}
            />
          </div>
        </Card>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Exercise'}
          </Button>
          <Link to="/admin/exercises">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

function Text({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      <input
        required={label !== 'Equipment' && label !== 'Duration (seconds)'}
        className="w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
        {...props}
      />
    </label>
  )
}

function Area({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      <textarea
        rows="4"
        className="w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
        {...props}
      />
    </label>
  )
}

function Select({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      <select
        required
        className="w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
        {...props}
      >
        <option value="">Select difficulty</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
        <option>All Levels</option>
      </select>
    </label>
  )
}

function File({ label, current, onChange, ...props }) {
  const [fileName, setFileName] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setFileName(file ? file.name : '')
    if (onChange) onChange(event)
  }

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-surface transition-all duration-200 hover:bg-accent-bright shadow-glow shrink-0 focus-within:ring-2 focus-within:ring-white">
          Choose file
          <input
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            {...props}
          />
        </label>
        <span className="truncate text-sm text-gray-400">
          {fileName || 'No file chosen'}
        </span>
      </div>
      {current && (
        <span className="mt-1.5 block text-xs text-accent">
          Existing media will be kept.
        </span>
      )}
    </div>
  )
}
