/**
 * Device Flow Hook
 */

import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDeviceFlowStart, useDeviceFlowStatus } from '../../../api/hooks/useOAuth'
import { queryKeys } from '../../../api/queryKeys'
import type { DeviceFlowProvider } from '../../../api/types'

type DeviceFlowStatus = 'idle' | 'polling' | 'success' | 'error' | 'expired'

interface UseDeviceFlowOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useDeviceFlow(options?: UseDeviceFlowOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [provider, setProvider] = useState<DeviceFlowProvider | null>(null)
  const [userCode, setUserCode] = useState<string | null>(null)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [state, setState] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState(0)
  const [interval, setInterval] = useState(5)
  const [status, setStatus] = useState<DeviceFlowStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const deviceFlowMutation = useDeviceFlowStart()

  // Poll for status
  useDeviceFlowStatus(
    state,
    interval,
    status === 'polling',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.authFilesList() })
        setStatus('success')
        options?.onSuccess?.()
        setTimeout(() => reset(), 2000)
      },
      onError: (err: string) => {
        setStatus('error')
        setError(err)
        options?.onError?.(err)
      },
    }
  )

  // Handle expiration
  useEffect(() => {
    if (status !== 'polling' || expiresIn <= 0) return

    const timer = setTimeout(() => {
      setStatus('expired')
      options?.onError?.('Authorization code has expired')
    }, expiresIn * 1000)

    return () => clearTimeout(timer)
  }, [status, expiresIn, options])

  const startDeviceFlow = useCallback(async (selectedProvider: DeviceFlowProvider) => {
    try {
      setProvider(selectedProvider)
      setStatus('polling')
      setError(null)
      setIsOpen(true)

      const response = await deviceFlowMutation.mutateAsync({ provider: selectedProvider })

      if (response.flow_type && response.flow_type !== 'device') {
        throw new Error(`Unexpected flow type: ${response.flow_type}`)
      }

      if (!response.user_code || (!response.verification_url && !response.auth_url)) {
        throw new Error('Invalid device flow response')
      }

      setUserCode(response.user_code)
      setVerificationUrl(
        response.auth_url || 
        response.verification_url || 
        null
      )
      setState(response.state)
      setExpiresIn(response.expires_in || 900)
      setInterval(response.interval || 5)
    } catch (err) {
      setStatus('error')
      const msg = err instanceof Error ? err.message : 'Failed to start device flow'
      setError(msg)
      options?.onError?.(msg)
    }
  }, [deviceFlowMutation, options])

  const cancel = useCallback(() => {
    setStatus('idle')
    setIsOpen(false)
    setProvider(null)
    setUserCode(null)
    setVerificationUrl(null)
    setState(null)
    setExpiresIn(0)
    setError(null)
  }, [])

  const reset = useCallback(() => cancel(), [cancel])

  const retry = useCallback(() => {
    if (provider) {
      cancel()
      // Small delay before restarting
      setTimeout(() => {
        startDeviceFlow(provider)
      }, 100)
    }
  }, [provider, cancel, startDeviceFlow])

  return {
    isOpen,
    provider,
    userCode,
    verificationUrl,
    expiresIn,
    status,
    error,
    startDeviceFlow,
    cancel,
    reset,
    retry,
  }
}
