import { useState } from 'react'
import Card from '../UI/Card'
import { muscleLabels } from '../../data/exercises'
import { clsx } from '../../utils/clsx'

function AnatomyFigure({ view, tab }) {
  const muscleColors = {
    'Pectoralis Major': '#EF4444',
    'Anterior Deltoid': '#F97316',
    'Triceps Brachii': '#EAB308',
  }

  const isHighlighted = (muscle) => {
    if (tab === 'primary') return muscle === 'Pectoralis Major'
    return muscle !== 'Pectoralis Major'
  }

  return (
    <div className="relative flex-1 min-w-0">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 text-center">{view}</p>
      <svg viewBox="0 0 80 140" className="w-full max-w-[100px] mx-auto" fill="none">
        {/* Head */}
        <ellipse cx="40" cy="14" rx="12" ry="14" fill="#374151" />
        {/* Torso */}
        <path
          d="M28 28 Q40 26 52 28 L54 70 Q40 74 26 70 Z"
          fill="#4B5563"
        />
        {/* Chest muscle */}
        {view === 'Front' && (
          <ellipse
            cx="40"
            cy="48"
            rx="14"
            ry="10"
            fill={isHighlighted('Pectoralis Major') ? muscleColors['Pectoralis Major'] : '#4B5563'}
            opacity={isHighlighted('Pectoralis Major') ? 0.85 : 0.3}
          />
        )}
        {/* Back muscles */}
        {view === 'Back' && (
          <>
            <rect x="30" y="35" width="8" height="30" rx="3" fill="#EF4444" opacity={tab === 'primary' ? 0.3 : 0.15} />
            <rect x="42" y="35" width="8" height="30" rx="3" fill="#EF4444" opacity={tab === 'primary' ? 0.3 : 0.15} />
          </>
        )}
        {/* Shoulders */}
        <circle
          cx="22"
          cy="36"
          r="7"
          fill={isHighlighted('Anterior Deltoid') && view === 'Front' ? muscleColors['Anterior Deltoid'] : '#4B5563'}
          opacity={isHighlighted('Anterior Deltoid') && view === 'Front' ? 0.8 : 0.4}
        />
        <circle
          cx="58"
          cy="36"
          r="7"
          fill={isHighlighted('Anterior Deltoid') && view === 'Front' ? muscleColors['Anterior Deltoid'] : '#4B5563'}
          opacity={isHighlighted('Anterior Deltoid') && view === 'Front' ? 0.8 : 0.4}
        />
        {/* Arms */}
        <rect x="12" y="38" width="8" height="35" rx="3" fill="#4B5563" />
        <rect x="60" y="38" width="8" height="35" rx="3" fill="#4B5563" />
        <ellipse
          cx="16"
          cy="78"
          rx="5"
          ry="6"
          fill={isHighlighted('Triceps Brachii') ? muscleColors['Triceps Brachii'] : '#4B5563'}
          opacity={isHighlighted('Triceps Brachii') ? 0.8 : 0.4}
        />
        <ellipse
          cx="64"
          cy="78"
          rx="5"
          ry="6"
          fill={isHighlighted('Triceps Brachii') ? muscleColors['Triceps Brachii'] : '#4B5563'}
          opacity={isHighlighted('Triceps Brachii') ? 0.8 : 0.4}
        />
        {/* Legs */}
        <rect x="30" y="72" width="9" height="55" rx="3" fill="#374151" />
        <rect x="41" y="72" width="9" height="55" rx="3" fill="#374151" />
      </svg>
    </div>
  )
}

export default function TargetMuscles({ primaryMuscles, secondaryMuscles }) {
  const [tab, setTab] = useState('primary')

  const legendMuscles = tab === 'primary' ? primaryMuscles : secondaryMuscles

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Target Muscles</h3>
        <div className="flex gap-1 p-0.5 bg-surface rounded-lg">
          {['primary', 'secondary'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-md capitalize transition-all',
                tab === t ? 'bg-accent text-surface' : 'text-gray-400 hover:text-white',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center mb-4 p-3 bg-surface rounded-xl">
        <AnatomyFigure view="Front" tab={tab} />
        <AnatomyFigure view="Back" tab={tab} />
      </div>

      <div className="space-y-2">
        {legendMuscles.map((muscle) => {
          const info = muscleLabels[muscle]
          const color = info?.type === 'primary' ? 'bg-muscle-primary' : info?.type === 'secondary' ? 'bg-muscle-secondary' : 'bg-muscle-tertiary'
          return (
            <div key={muscle} className="flex items-center gap-2">
              <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', color)} />
              <span className="text-xs text-gray-300">{info?.label || muscle}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
