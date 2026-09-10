import { clsx } from '../../utils/clsx'

export default function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface-card border border-surface-border rounded-2xl shadow-card',
        padding && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
