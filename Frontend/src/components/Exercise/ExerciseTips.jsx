import { Lightbulb } from 'lucide-react'
import Card from '../UI/Card'

export default function ExerciseTips({ tip }) {
  return (
    <Card className="bg-gradient-to-br from-tips to-surface-card border-tips-border">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-purple-200 mb-1">Tips</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{tip}</p>
        </div>
      </div>
    </Card>
  )
}
