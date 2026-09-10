import { useState } from 'react'
import { User } from 'lucide-react'
import Card from '../UI/Card'
import { modelOptions } from '../../data/exercises'
import { clsx } from '../../utils/clsx'

function ModelThumbnail({ model, isSelected, onSelect }) {
  const isAnatomy = model.type === 'anatomy'

  return (
    <button
      onClick={() => onSelect(model.id)}
      className={clsx(
        'relative rounded-xl overflow-hidden border-2 transition-all aspect-square',
        isSelected ? 'border-accent shadow-glow' : 'border-surface-border hover:border-gray-500',
      )}
    >
      <div
        className={clsx(
          'w-full h-full flex flex-col items-center justify-center gap-1 p-2',
          isAnatomy ? 'bg-[#1a1520]' : 'bg-gradient-to-b from-gray-700 to-gray-900',
        )}
      >
        <svg viewBox="0 0 40 60" className="w-8 h-12" fill="none">
          <ellipse cx="20" cy="10" rx="7" ry="8" fill={isAnatomy ? '#7C3AED' : '#9CA3AF'} opacity="0.8" />
          <rect x="14" y="18" width="12" height="22" rx="4" fill={isAnatomy ? '#6D28D9' : '#6B7280'} opacity="0.8" />
          <rect x="8" y="20" width="5" height="18" rx="2" fill={isAnatomy ? '#5B21B6' : '#4B5563'} opacity="0.7" />
          <rect x="27" y="20" width="5" height="18" rx="2" fill={isAnatomy ? '#5B21B6' : '#4B5563'} opacity="0.7" />
          <rect x="14" y="40" width="5" height="18" rx="2" fill={isAnatomy ? '#4C1D95' : '#374151'} opacity="0.7" />
          <rect x="21" y="40" width="5" height="18" rx="2" fill={isAnatomy ? '#4C1D95' : '#374151'} opacity="0.7" />
          {isAnatomy && (
            <>
              <ellipse cx="20" cy="28" rx="5" ry="4" fill="#EF4444" opacity="0.6" />
              <ellipse cx="20" cy="36" rx="4" ry="3" fill="#F97316" opacity="0.5" />
            </>
          )}
        </svg>
        <User className="w-3 h-3 text-gray-500" />
      </div>
      <span className="absolute bottom-0 inset-x-0 bg-surface/90 text-[9px] text-gray-400 py-1 px-1 truncate">
        {model.label.split(' ').slice(0, 2).join(' ')}
      </span>
    </button>
  )
}

export default function ModelSelector({ selectedModel, onSelectModel }) {
  const [genderTab, setGenderTab] = useState('male')

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">Choose Model</h3>

      <div className="flex gap-1 p-1 bg-surface rounded-xl mb-4">
        {['male', 'female'].map((tab) => (
          <button
            key={tab}
            onClick={() => tab === 'male' && setGenderTab(tab)}
            disabled={tab === 'female'}
            className={clsx(
              'flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all',
              tab === 'female'
                ? 'cursor-not-allowed text-gray-600'
                : genderTab === tab
                  ? 'bg-accent text-surface'
                  : 'text-gray-400 hover:text-white',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {modelOptions[genderTab].map((model) => (
          <ModelThumbnail
            key={model.id}
            model={model}
            isSelected={selectedModel === model.id}
            onSelect={onSelectModel}
          />
        ))}
      </div>
    </Card>
  )
}
