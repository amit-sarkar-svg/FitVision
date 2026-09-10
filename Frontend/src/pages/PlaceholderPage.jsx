import { motion } from 'framer-motion'

export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6"
    >
      <div className="max-w-2xl mx-auto text-center py-16">
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-accent" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        <div className="mt-8 h-px bg-surface-border max-w-xs mx-auto" />
        <p className="mt-6 text-xs text-gray-500">This section will be fully implemented in a future phase.</p>
      </div>
    </motion.div>
  )
}
