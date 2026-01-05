/**
 * Common API types shared across all endpoints
 * Updated for v1 API with response envelope
 */

// ============================================================================
// Response Envelope Types
// ============================================================================

/**
 * API response metadata
 */
export interface ApiMeta {
  timestamp: string // ISO 8601 format
  version: string
}

/**
 * Standard API response envelope
 * All successful responses are wrapped in this format
 */
export interface ApiEnvelope<T> {
  data: T
  meta: ApiMeta
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

// ============================================================================
// Common Response Types
// ============================================================================

/**
 * Standard success response
 */
export interface StatusOkResponse {
  status: 'ok'
}

/**
 * Success response with changed fields
 */
export interface SuccessResponse {
  ok: boolean
  changed?: string[]
}

// ============================================================================
// Common Request Types
// ============================================================================

/**
 * Authentication configuration for API client
 */
export interface AuthConfig {
  bearerToken?: string
  managementKey?: string
}

/**
 * Generic setting update request with value wrapper
 */
export interface SettingUpdateRequest<T> {
  value: T
}

/**
 * Boolean value wrapper for PUT requests
 */
export interface BooleanValue {
  value: boolean
}

/**
 * Integer value wrapper for PUT requests
 */
export interface IntegerValue {
  value: number
}

/**
 * String value wrapper for PUT requests
 */
export interface StringValue {
  value: string
}
