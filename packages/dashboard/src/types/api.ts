/**
 * Common API Response Types
 *
 * Defines error responses and shared schemas used across all API endpoints.
 */

/**
 * Error response schema - consistent across all endpoints
 */
export interface ApiError {
  /** Machine-readable error code (e.g., WORKORDER_NOT_FOUND) */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Additional error details */
  details?: Record<string, any>;
}

/**
 * Generic error response wrapper
 */
export interface ApiErrorResponse {
  /** Always false for error responses */
  success: false;

  /** Error details */
  error: ApiError;

  /** ISO 8601 timestamp of response */
  timestamp: string;
}

/**
 * Predefined error codes and messages
 */
export const ErrorCodes = {
  CONFIG_MISSING: {
    code: 'CONFIG_MISSING',
    message: 'projects.config.json not found or invalid',
  },
  CONFIG_INVALID: {
    code: 'CONFIG_INVALID',
    message: 'projects.config.json is invalid JSON',
  },
  PARSE_ERROR: {
    code: 'PARSE_ERROR',
    message: 'Failed to parse JSON file',
  },
  WORKORDER_NOT_FOUND: {
    code: 'WORKORDER_NOT_FOUND',
    message: 'Workorder not found in any project',
  },
  FOLDER_NOT_FOUND: {
    code: 'FOLDER_NOT_FOUND',
    message: 'Required folder not found',
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: 'Permission denied when accessing file system',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  },
} as const;

/**
 * HTTP Status Codes used by API
 */
export const HttpStatus = {
  OK: 200,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  INTERNAL_ERROR: 500,
} as const;

/**
 * Utility to create consistent error responses
 */
export function createErrorResponse(
  error: (typeof ErrorCodes)[keyof typeof ErrorCodes],
  details?: Record<string, any>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Utility to create successful responses
 */
export function createSuccessResponse<T>(
  data: T,
  timestamp?: string
): { success: true; data: T; timestamp: string } {
  return {
    success: true,
    data,
    timestamp: timestamp || new Date().toISOString(),
  };
}
