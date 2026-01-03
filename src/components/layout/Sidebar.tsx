import { Link, useRouterState } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../ui/Icon'
import { Tooltip } from '../ui/Tooltip'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Overview', icon: 'dashboard' },
  { path: '/providers', label: 'Providers', icon: 'dns' },
  { path: '/api-keys', label: 'API Keys', icon: 'vpn_key' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics' },
  { path: '/logs', label: 'Logs', icon: 'receipt_long' },
  { path: '/models', label: 'Models', icon: 'view_module' },
  { path: '/config', label: 'Config', icon: 'code' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
]

export function Sidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed))
  }, [isCollapsed])

  return (
    <aside 
      className={cn(
        "h-full flex flex-col border-r border-(--border-color) bg-(--bg-card) z-20 hidden md:flex transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center overflow-hidden whitespace-nowrap", isCollapsed ? "p-4 justify-center" : "p-6 gap-3")}>
        <div className="size-8 rounded-lg bg-(--accent-primary) text-(--accent-primary-fg) flex items-center justify-center shadow-sm flex-shrink-0">
          <Icon name="hub" size="md" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-sm font-semibold leading-none tracking-tight text-(--text-primary)">
              LLM-Mux
            </h1>
            <p className="text-xs text-(--text-secondary) mt-1">Gateway Admin</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-2 flex flex-col gap-0.5", isCollapsed ? "px-2" : "px-4")}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path
          
          const LinkComponent = (
            <Link
              to={item.path}
              preload="intent"
              className={cn(
                'relative flex items-center gap-3 px-3 py-2 rounded-md outline-none focus:outline-none focus-visible:ring-0 overflow-hidden whitespace-nowrap',
                !isActive && 'hover:bg-(--bg-hover)',
                isCollapsed && 'justify-center px-0'
              )}
            >
              {/* Animated background indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-(--accent-subtle) border border-(--border-color)/50 rounded-md"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <motion.span
                className="relative z-10 flex items-center gap-3"
                initial={false}
                animate={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                transition={{ duration: 0.15 }}
              >
                <motion.span
                  className="flex items-center justify-center"
                  initial={false}
                  animate={{ scale: isActive ? 1 : 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Icon name={item.icon} size="lg" filled={isActive} />
                </motion.span>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium leading-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.span>
            </Link>
          )

          return (
            <div key={item.path}>
              {isCollapsed ? (
                <Tooltip content={item.label} side="right">
                  {LinkComponent}
                </Tooltip>
              ) : (
                LinkComponent
              )}
            </div>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className={cn("border-t border-(--border-color) overflow-hidden", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn(
            "flex items-center gap-3 rounded-lg hover:bg-(--bg-hover) transition-colors cursor-pointer group whitespace-nowrap",
            isCollapsed ? "justify-center p-2" : "px-3 py-2"
        )}>
          <div className="size-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex-shrink-0" />
          {!isCollapsed && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex flex-col flex-1 min-w-0"
             >
              <p className="text-sm font-medium text-(--text-primary) truncate">Admin</p>
              <p className="text-xs text-(--text-secondary) truncate">admin@llm-mux.io</p>
             </motion.div>
          )}
          {!isCollapsed && (
            <Icon
                name="unfold_more"
                size="sm"
                className="text-(--text-secondary) group-hover:text-(--text-primary)"
            />
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-4 right-0 translate-x-1/2 size-6 rounded-full bg-(--bg-card) border border-(--border-color) flex items-center justify-center hover:bg-(--bg-hover) transition-colors z-50 shadow-sm text-(--text-secondary)"
      >
        <Icon name={isCollapsed ? 'chevron_right' : 'chevron_left'} size="sm" />
      </button>
    </aside>
  )
}
