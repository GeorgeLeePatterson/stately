/**
 * Extracts a user-friendly error message from an API error response.
 *
 * The openapi-fetch library returns errors in various formats:
 * - error.message (for error responses with a message field)
 * - error as a string
 * - error as an object with other fields
 *
 * @param error - The error object from an openapi-fetch response
 * @param fallback - Default message if no specific error can be extracted
 * @returns A user-friendly error message
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "An error occurred",
): string {
  if (!error) {
    return fallback;
  }

  // If error is a string, return it directly
  if (typeof error === "string") {
    return error;
  }

  // If error has a message property (most API responses)
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  // Try to stringify the error object
  try {
    const stringified = JSON.stringify(error);
    if (stringified !== "{}" && stringified !== "null") {
      return stringified;
    }
  } catch {
    // JSON.stringify failed, continue to fallback
  }

  return fallback;
}
