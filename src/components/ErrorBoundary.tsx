import { Component, type ReactNode } from 'react'
import { Icon } from './ui/Icon'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
      if (this.state.hasError) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-(--bg-body)">
            <div className="bg-(--bg-card) p-6 rounded-lg border border-(--border-color) shadow-lg max-w-md text-center">
              <div className="size-12 rounded-full bg-(--danger-bg) flex items-center justify-center mx-auto mb-4">
                <Icon name="error" size="lg" className="text-(--danger-text)" />
              </div>
              <h2 className="text-2xl font-semibold text-(--text-primary) mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-(--text-secondary) mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            <Button variant="primary" onClick={this.handleRetry}>
              <Icon name="refresh" size="sm" className="mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
