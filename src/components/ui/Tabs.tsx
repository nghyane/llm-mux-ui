import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

interface Tab {
  id: string
  label: string
  icon?: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 p-0.5 bg-(--bg-hover) rounded-lg border border-(--border-color)/50 w-fit',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
              isActive
                ? 'text-(--text-primary)'
                : 'text-(--text-secondary) hover:text-(--text-primary)'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tabs-indicator"
                className="absolute inset-0 bg-(--bg-card) shadow-sm border border-(--border-color)/50 rounded-md"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <Icon name={tab.icon} size="sm" />}
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
