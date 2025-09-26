/**
 * API Error handling utilities
 */

export interface ApiError {
  errors?: Array<{
    message: string;
    code?: string;
    path?: string[];
  }>;
  message?: string;
  status?: number;
  statusCode?: number;
}

/**
 * Safely extracts error message from API error response
 * @param error - Unknown error object
 * @returns User-friendly error message
 */
export function extractErrorMessage(
  error: unknown,
  fallback = "An error occurred",
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    return apiError.errors?.[0]?.message || apiError.message || fallback;
  }

  return fallback;
}
