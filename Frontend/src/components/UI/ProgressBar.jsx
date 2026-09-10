import { clsx } from '../../utils/clsx'

export default function ProgressBar({
  value = 0,
  max = 100,
  className = '',
  barClassName = '',
  showLabel = false,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
        <div
          className={clsx('h-full bg-accent rounded-full transition-all duration-300', barClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
