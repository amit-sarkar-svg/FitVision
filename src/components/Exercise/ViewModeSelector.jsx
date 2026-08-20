import Card from '../UI/Card'
import Button from '../UI/Button'

const modes = [
  { id: '3d', label: '3D Model' },
  { id: 'video', label: 'Real Video' },
]

export default function ViewModeSelector({ mode, onModeChange, videoOnly = false }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">View Mode</h3>
      <div className="flex gap-2">
        {modes.map(({ id, label }) => (
          <Button
            key={id}
            variant={mode === id ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            active={mode === id}
            onClick={() => (videoOnly ? id === 'video' : id === '3d') && onModeChange(id)}
            disabled={videoOnly ? id === '3d' : id === 'video'}
          >
            {label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
