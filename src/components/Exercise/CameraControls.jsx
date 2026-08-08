import { Box } from 'lucide-react'
import Card from '../UI/Card'
import Button from '../UI/Button'

const angles = [
  { id: 'front', label: 'Front', icon: Box },
  { id: 'side', label: 'Side', icon: Box },
  { id: 'top45', label: 'Top 45°', icon: Box },
]

export default function CameraControls({ angle, onAngleChange }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">Camera Angle</h3>
      <div className="grid grid-cols-3 gap-2">
        {angles.map(({ id, label }) => (
          <Button
            key={id}
            variant={angle === id ? 'primary' : 'secondary'}
            size="sm"
            className="flex-col gap-1 py-3"
            onClick={() => onAngleChange(id)}
          >
            <div className="w-6 h-6 border border-current rounded opacity-60" />
            <span className="text-[10px]">{label}</span>
          </Button>
        ))}
      </div>
    </Card>
  )
}
