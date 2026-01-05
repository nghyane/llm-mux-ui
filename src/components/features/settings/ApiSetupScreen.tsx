import { useState, useId } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Icon } from '../../ui/Icon'
import { Card } from '../../ui/Card'
import { motion } from 'framer-motion'
import type { ApiConfig } from '../../../context/ApiConfigContext'
import { DEFAULT_BASE_URL } from '../../../context/ApiConfigContext'

interface ApiSetupScreenProps {
  onComplete: (config: ApiConfig) => void
  onTest: (config: ApiConfig) => Promise<boolean>
  isConnecting?: boolean
}

type TestState = 'idle' | 'testing' | 'success' | 'error'

export function ApiSetupScreen({ onComplete, onTest }: ApiSetupScreenProps) {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [managementKey, setManagementKey] = useState('')
  const [testState, setTestState] = useState<TestState>('idle')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  const baseUrlId = useId()
  const mgmtKeyId = useId()

  const handleTestConnection = async () => {
    if (!managementKey.trim()) {
      setTestState('error')
      setErrorMessage('Please enter a management key')
      return
    }

    setTestState('testing')
    setErrorMessage('')

    const testConfig: ApiConfig = {
      baseUrl: baseUrl.trim(),
      managementKey: managementKey.trim(),
    }

    const success = await onTest(testConfig)

    if (success) {
      setTestState('success')
      setErrorMessage('')
    } else {
      setTestState('error')
      setErrorMessage('Failed to connect. Please verify your credentials and ensure the server is running.')
    }
  }

  const handleConnect = () => {
    if (!managementKey.trim() || testState !== 'success') {
      return
    }

    const config: ApiConfig = {
      baseUrl: baseUrl.trim(),
      managementKey: managementKey.trim(),
    }

    onComplete(config)
  }

  const isValid = managementKey.trim() !== '' && baseUrl.trim() !== ''
  const canConnect = testState === 'success' && isValid

  return (
    <div className="fixed inset-0 z-50 bg-(--bg-body) overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-(--accent-primary) to-(--text-tertiary) rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Icon name="hub" className="text-(--accent-primary-fg) text-[32px]" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-2xl font-semibold tracking-tight text-(--text-primary) mb-2"
          >
            LLM-MUX
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-(--text-secondary) text-sm"
          >
            Multi-provider LLM Gateway Management
          </motion.p>
        </div>

        {/* Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            {/* Card Header */}
            <div className="p-6 border-b border-(--border-color) bg-(--bg-surface)">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-(--accent-primary)/10 rounded-lg flex items-center justify-center">
                  <Icon name="settings" className="text-(--accent-primary)" size="md" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-(--text-primary)">
                    Connect to API
                  </h2>
                  <p className="text-xs text-(--text-secondary)">
                    Configure your connection to get started
                  </p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              {/* Base URL */}
              <div className="space-y-2">
                <label htmlFor={baseUrlId} className="block text-sm font-medium text-(--text-primary)">
                  Base URL
                  <span className="text-(--text-tertiary) font-normal ml-2">
                    (Management API endpoint)
                  </span>
                </label>
                <Input
                  id={baseUrlId}
                  type="text"
                  value={baseUrl}
                  onChange={(e) => {
                    setBaseUrl(e.target.value)
                    setTestState('idle')
                    setErrorMessage('')
                  }}
                  placeholder={DEFAULT_BASE_URL}
                  icon="link"
                  iconPosition="left"
                  disabled={testState === 'testing'}
                />
                <p className="text-xs text-(--text-secondary)">
                  The URL where your llm-mux management API is running
                </p>
              </div>

              {/* Management Key */}
              <div className="space-y-2">
                <label htmlFor={mgmtKeyId} className="block text-sm font-medium text-(--text-primary)">
                  Management Key
                  <span className="text-(--danger-text) ml-1">*</span>
                </label>
                <div className="relative">
                  <Input
                    id={mgmtKeyId}
                    type={showPassword ? 'text' : 'password'}
                    value={managementKey}
                    onChange={(e) => {
                      setManagementKey(e.target.value)
                      setTestState('idle')
                      setErrorMessage('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isValid) {
                        handleTestConnection()
                      }
                    }}
                    placeholder="Enter your X-Management-Key"
                    icon="key"
                    iconPosition="left"
                    className="pr-10"
                    disabled={testState === 'testing'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-primary) transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    disabled={testState === 'testing'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} size="sm" />
                  </button>
                </div>
                <p className="text-xs text-(--text-secondary)">
                  Your authentication key for the management API
                </p>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={handleTestConnection}
                  disabled={!isValid || testState === 'testing'}
                  className="w-full"
                >
                  {testState === 'testing' ? (
                    <>
                      <Icon name="sync" className="animate-spin" size="sm" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Icon name="wifi" size="sm" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>

              {/* Test Result Messages */}
              {testState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-4 bg-(--success-bg) border border-(--success-text)/20 rounded-lg">
                    <Icon name="check_circle" size="sm" className="text-(--success-text) mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--success-text) mb-1">
                        Connection Successful!
                      </p>
                      <p className="text-xs text-(--success-text)/80">
                        Your credentials have been verified. Click Connect to continue.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {testState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-4 bg-(--danger-bg) border border-(--danger-text)/20 rounded-lg">
                    <Icon name="error" size="sm" className="text-(--danger-text) mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--danger-text) mb-1">
                        Connection Failed
                      </p>
                      <p className="text-xs text-(--danger-text)/80">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Connect Button */}
              {testState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="pt-2"
                >
                  <Button
                    variant="primary"
                    onClick={handleConnect}
                    disabled={!canConnect}
                    className="w-full"
                  >
                    <Icon name="check" size="sm" />
                    Connect to Dashboard
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Card Footer - Help Section */}
            <div className="px-6 pb-6">
              <div className="flex items-start gap-3 p-4 bg-(--accent-subtle) border border-(--border-color) rounded-lg">
                <Icon name="help_outline" size="sm" className="text-(--text-tertiary) mt-0.5 shrink-0" />
                <div className="text-xs text-(--text-secondary) flex-1 min-w-0">
                  <p className="font-medium text-(--text-primary) mb-2">
                    Need help getting started?
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Check your llm-mux server configuration file</li>
                    <li>Management key is set in your server settings</li>
                    <li>Default port: 8318 for management API</li>
                    <li>Ensure your server is running and accessible</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-center text-xs text-(--text-tertiary) mt-6"
          >
            Your credentials are stored locally and never shared
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
