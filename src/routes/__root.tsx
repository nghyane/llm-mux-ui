import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { MobileNav } from '../components/layout/MobileNav'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ApiSetupScreen } from '../components/features/settings/ApiSetupScreen'
import { useApiConfigContext } from '../context/ApiConfigContext'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { isConfigured, saveConfig, testConnection } = useApiConfigContext()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  
  const mainContentId = 'main-content'

  useEffect(() => {
    if (currentPath) {
      setIsMobileNavOpen(false)
    }
  }, [currentPath])

  if (!isConfigured) {
    return (
      <ApiSetupScreen
        onComplete={saveConfig}
        onTest={testConnection}
      />
    )
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex overflow-hidden antialiased">
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-(--bg-card) focus:border focus:border-(--border-color) focus:rounded-md focus:text-(--text-primary)"
        >
          Skip to main content
        </a>

        <Sidebar />

        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <main
          id={mainContentId}
          className="flex-1 flex flex-col h-full overflow-hidden relative bg-(--bg-muted) bg-pattern"
        >
          <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />

          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
