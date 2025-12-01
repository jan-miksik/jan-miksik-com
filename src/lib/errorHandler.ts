/**
 * Standardized error handling utility
 * Converts unknown errors to Error objects and logs them consistently
 */

/**
 * Normalizes an unknown error to an Error object
 * @param err - The error to normalize
 * @returns An Error object
 */
export function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === 'string') {
    return new Error(err);
  }
  return new Error(String(err));
}

/**
 * Logs an error with a consistent format
 * @param context - The context/module name where the error occurred
 * @param err - The error to log
 * @param additionalInfo - Optional additional information to log
 */
export function logError(context: string, err: unknown, additionalInfo?: string): Error {
  const errorObj = normalizeError(err);
  const prefix = `[${context}]`;
  const message = additionalInfo 
    ? `${prefix} ${additionalInfo}: ${errorObj.message}`
    : `${prefix} ${errorObj.message}`;
  
  console.error(message, errorObj);
  return errorObj;
}

