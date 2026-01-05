import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { queryKeys } from '../queryKeys'
import { oauthApi } from '../endpoints'
import {
  createOAuthMessageHandler,
  openOAuthPopup,
  monitorPopupClose,
} from '../../lib/oauth-message-handler'
import { OAuthStateManager, validateOAuthUrl, sanitizeOAuthError } from '../../lib/oauth-security'
import type { OAuthStartRequest, OAuthProvider } from '../types'

export function useOAuthStart() {
  return useMutation({
    mutationFn: (data: OAuthStartRequest) => oauthApi.start(data),
  })
}

export function useOAuthCancel() {
  return useMutation({
    mutationFn: (state: string) => oauthApi.cancel(state),
  })
}

export function useDeviceFlowStart() {
  return useMutation({
    mutationFn: (data: OAuthStartRequest) => oauthApi.start(data),
  })
}

export function useOAuthStatus(
  state: string | null,
  options: {
    enabled?: boolean
    onSuccess?: () => void
    onError?: (error: string) => void
    pollingInterval?: number
  } = {}
) {
  const { enabled = false, onSuccess, onError, pollingInterval = 2000 } = options
  const [messageReceived, setMessageReceived] = useState(false)

  useEffect(() => {
    if (!state || !enabled) return

    return createOAuthMessageHandler({
      expectedState: state,
      onSuccess: () => {
        setMessageReceived(true)
        onSuccess?.()
      },
      onError: (_provider, error) => {
        setMessageReceived(true)
        onError?.(sanitizeOAuthError(error))
      },
    })
  }, [state, enabled, onSuccess, onError])

  const query = useQuery({
    queryKey: queryKeys.oauthStatus(state || ''),
    queryFn: () => oauthApi.getStatus(state!),
    enabled: enabled && !!state && !messageReceived,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status && status !== 'pending') return false
      return pollingInterval
    },
    gcTime: 0,
  })

  useEffect(() => {
    if (!query.data || messageReceived) return
    const { status, error } = query.data

    if (status === 'completed') {
      onSuccess?.()
    } else if (status === 'failed' || status === 'cancelled') {
      onError?.(sanitizeOAuthError(error || `OAuth ${status}`))
    }
  }, [query.data, messageReceived, onSuccess, onError])

  return { ...query, messageReceived }
}

export function useDeviceFlowStatus(
  state: string | null,
  interval: number,
  enabled: boolean,
  options: {
    onSuccess?: () => void
    onError?: (error: string) => void
  } = {}
) {
  const { onSuccess, onError } = options

  const query = useQuery({
    queryKey: queryKeys.oauthStatus(state || ''),
    queryFn: () => oauthApi.getStatus(state!),
    enabled: enabled && !!state,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status && status !== 'pending') return false
      return interval * 1000
    },
    gcTime: 0,
  })

  useEffect(() => {
    if (!query.data) return
    const { status, error } = query.data

    if (status === 'completed') {
      onSuccess?.()
    } else if (status === 'failed' || status === 'cancelled') {
      onError?.(error || `Device flow ${status}`)
    }
  }, [query.data, onSuccess, onError])

  return query
}

const OAUTH_TIMEOUT_MS = 5 * 60 * 1000

export interface OAuthFlowState {
  isLoading: boolean
  error: string | null
  state: string | null
  startFlow: (provider: OAuthProvider, projectId?: string) => Promise<void>
  cancelFlow: () => void
}

export function useOAuthFlow(options: {
  onSuccess?: (provider: string) => void
  onError?: (provider: string, error: string) => void
} = {}): OAuthFlowState {
  const { onSuccess, onError } = options
  const queryClient = useQueryClient()

  const [flowState, setFlowState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string | null>(null)
  
  const popupRef = useRef<Window | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completedRef = useRef(false)

  const startMutation = useOAuthStart()
  const cancelMutation = useOAuthCancel()

  const cleanup = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    popupRef.current = null
    setFlowState(null)
    setIsPolling(false)
    completedRef.current = false
  }, [])

  const handleSuccess = useCallback((provider: string) => {
    if (completedRef.current) return
    completedRef.current = true
    popupRef.current?.close()
    queryClient.invalidateQueries({ queryKey: queryKeys.authFilesList() })
    OAuthStateManager.clearAll()
    cleanup()
    onSuccess?.(provider)
  }, [cleanup, onSuccess, queryClient])

  const handleError = useCallback((provider: string, err: string) => {
    if (completedRef.current) return
    completedRef.current = true
    popupRef.current?.close()
    setError(err)
    cleanup()
    onError?.(provider, err)
  }, [cleanup, onError])

  const statusQuery = useQuery({
    queryKey: queryKeys.oauthStatus(flowState || ''),
    queryFn: () => oauthApi.getStatus(flowState!),
    enabled: isPolling && !!flowState && !completedRef.current,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status && status !== 'pending') return false
      return 2000
    },
    gcTime: 0,
  })

  useEffect(() => {
    if (!statusQuery.data || completedRef.current || !currentProvider) return
    const { status, error: pollError } = statusQuery.data

    if (status === 'completed') {
      handleSuccess(currentProvider)
    } else if (status === 'failed' || status === 'cancelled') {
      handleError(currentProvider, sanitizeOAuthError(pollError || `OAuth ${status}`))
    }
  }, [statusQuery.data, handleSuccess, handleError, currentProvider])

  const startFlow = useCallback(async (provider: OAuthProvider, projectId?: string) => {
    setError(null)
    cleanup()
    completedRef.current = false
    setCurrentProvider(provider)

    try {
      const response = await startMutation.mutateAsync({
        provider,
        project_id: projectId,
      })

      if (response.flow_type === 'device') {
        throw new Error('Device flow not supported in popup mode')
      }

      if (!response.auth_url || !validateOAuthUrl(response.auth_url)) {
        throw new Error('Invalid OAuth URL')
      }

      const stateValue = response.state
      OAuthStateManager.store(stateValue, provider)

      const messageCleanup = createOAuthMessageHandler({
        expectedState: stateValue,
        onSuccess: () => handleSuccess(provider),
        onError: (_, err) => handleError(provider, err),
      })

      const popup = openOAuthPopup(response.auth_url)
      if (!popup) {
        messageCleanup()
        throw new Error('Popup blocked. Please allow popups.')
      }

      popupRef.current = popup

      const popupCleanup = monitorPopupClose(popup, () => {
        if (!completedRef.current && stateValue) {
          cancelMutation.mutate(stateValue)
          cleanup()
        }
      })

      timeoutRef.current = setTimeout(() => {
        if (!completedRef.current) {
          handleError(provider, 'OAuth timeout - please try again')
          if (stateValue) cancelMutation.mutate(stateValue)
        }
      }, OAUTH_TIMEOUT_MS)

      cleanupRef.current = () => {
        messageCleanup()
        popupCleanup()
      }

      setFlowState(stateValue)
      setIsPolling(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start OAuth'
      setError(msg)
      onError?.(provider, msg)
    }
  }, [startMutation, cleanup, onError, handleSuccess, handleError, cancelMutation])

  const cancelFlow = useCallback(() => {
    if (flowState) cancelMutation.mutate(flowState)
    popupRef.current?.close()
    cleanup()
  }, [flowState, cancelMutation, cleanup])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    isLoading: startMutation.isPending || isPolling,
    error,
    state: flowState,
    startFlow,
    cancelFlow,
  }
}
