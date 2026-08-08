import { clsx } from '../utils/clsx'

const variants = {
  primary: 'bg-accent text-surface font-semibold hover:bg-accent-bright shadow-glow',
  secondary: 'bg-surface-card text-white border border-surface-border hover:bg-surface-hover',
  outline: 'border border-surface-border text-white hover:border-accent/50 hover:text-accent',
  ghost: 'text-gray-400 hover:text-white hover:bg-surface-hover',
  danger: 'text-red-400 hover:bg-red-400/10',
  icon: 'p-2 rounded-xl border border-surface-border text-gray-400 hover:text-white hover:border-surface-border hover:bg-surface-hover',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  active = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        active && variant === 'secondary' && 'border-accent bg-accent/10 text-accent',
        active && variant === 'outline' && 'border-accent text-accent bg-accent/10',
        active && variant === 'ghost' && 'text-accent bg-accent/10',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
