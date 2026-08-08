import { clsx } from '../../utils/clsx'

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-accent/15 text-accent border border-accent/30',
        variant === 'primary' && 'bg-muscle-primary/15 text-muscle-primary border border-muscle-primary/30',
        variant === 'secondary' && 'bg-muscle-secondary/15 text-muscle-secondary border border-muscle-secondary/30',
        className,
      )}
    >
      {children}
    </span>
  )
}
