import { useRouterState } from '@tanstack/react-router'
import { Icon } from '../ui/Icon'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/analytics': 'Analytics',
  '/models': 'Models',
  '/providers': 'Providers',
  '/logs': 'Logs',
  '/settings': 'Settings',
  '/config': 'Configuration',
  '/api-keys': 'API Keys',
}

interface HeaderProps {
  onOpenMobileNav: () => void
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const title = routeTitles[currentPath] || 'Dashboard'

  return (
    <header className="h-16 border-b border-(--border-color) flex items-center justify-between px-4 md:px-6 bg-(--bg-body)/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-(--bg-hover) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          aria-label="Open menu"
        >
          <Icon name="menu" size="lg" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-(--text-secondary) font-medium hover:text-(--text-primary) cursor-pointer transition-colors hidden sm:inline">
            Home
          </span>
          <span className="text-(--text-tertiary) hidden sm:inline">/</span>
          <span className="text-(--text-primary) font-medium">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative p-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Icon name="notifications" size="lg" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-(--danger-text) rounded-full border border-(--bg-body)" aria-hidden="true" />
        </button>

        <div className="h-4 w-px bg-(--border-color)" />

        <a
          href="/docs"
          className="text-xs font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          Documentation
        </a>
      </div>
    </header>
  )
}
