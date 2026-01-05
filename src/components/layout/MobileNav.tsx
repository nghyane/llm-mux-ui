import { Link, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/cn'
import { Icon } from '../ui/Icon'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { path: '/', label: 'Overview', icon: 'dashboard' },
  { path: '/providers', label: 'Providers', icon: 'dns' },
  { path: '/api-keys', label: 'API Keys', icon: 'vpn_key' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics' },
  { path: '/logs', label: 'Logs', icon: 'receipt_long' },
  { path: '/models', label: 'Models', icon: 'view_module' },
  { path: '/config', label: 'Config', icon: 'code' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
]

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
          
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-72 bg-(--bg-surface) border-r border-(--border-color) z-50 md:hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-(--border-color)">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-(--accent-primary) text-(--accent-primary-fg) flex items-center justify-center">
                  <Icon name="hub" size="md" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-(--text-primary)">LLM-Mux</h1>
                  <p className="text-xs text-(--text-secondary)">Gateway Admin</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-(--bg-hover) rounded-lg text-(--text-secondary) hover:text-(--text-primary) transition-colors"
              >
                <Icon name="close" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = currentPath === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-(--accent-primary) text-(--accent-primary-fg)'
                        : 'text-(--text-secondary) hover:bg-(--bg-hover) hover:text-(--text-primary)'
                    )}
                  >
                    <Icon name={item.icon} size="md" filled={isActive} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-(--border-color)">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-(--bg-hover) transition-colors">
                <div className="size-8 rounded-full bg-(--bg-muted)" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--text-primary) truncate">Admin</p>
                  <p className="text-xs text-(--text-secondary) truncate">admin@llm-mux.io</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
