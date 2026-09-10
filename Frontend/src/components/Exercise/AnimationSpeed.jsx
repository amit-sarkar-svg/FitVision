import Card from '../UI/Card'
import Button from '../UI/Button'

const speeds = ['0.5x', '1.0x', '1.5x', '2.0x']

export default function AnimationSpeed({ speed, onSpeedChange }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">Animation Speed</h3>
      <div className="grid grid-cols-4 gap-2">
        {speeds.map((s) => (
          <Button
            key={s}
            variant={speed === s ? 'primary' : 'secondary'}
            size="sm"
            className="px-2"
            onClick={() => onSpeedChange(s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </Card>
  )
}
