import Card from '../UI/Card'
import { muscleLabels } from '../../data/exercises'
import { clsx } from '../../utils/clsx'

export default function MusclesWorked({ primaryMuscles, secondaryMuscles }) {
  const allMuscles = [
    ...primaryMuscles.map((m) => ({ name: m, type: 'primary' })),
    ...secondaryMuscles.map((m) => ({ name: m, type: 'secondary' })),
  ]

  const dotColor = {
    primary: 'bg-muscle-primary',
    secondary: 'bg-muscle-secondary',
  }

  const badgeColor = {
    primary: 'text-muscle-primary',
    secondary: 'text-muscle-secondary',
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-4">Muscles Worked</h3>
      <div className="space-y-3">
        {allMuscles.map(({ name, type }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={clsx('w-2 h-2 rounded-full shrink-0', dotColor[type])} />
              <span className="text-sm text-gray-300 truncate">{muscleLabels[name]?.label || name}</span>
            </div>
            <span className={clsx('text-xs font-medium capitalize shrink-0 ml-2', badgeColor[type])}>
              {type}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
