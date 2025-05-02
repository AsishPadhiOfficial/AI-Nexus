export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'warning' | 'error' | 'critical',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export const ErrorCodes = {
  // Model related errors
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  MODEL_VALIDATION_FAILED: 'MODEL_VALIDATION_FAILED',
  MODEL_TRAINING_FAILED: 'MODEL_TRAINING_FAILED',
  MODEL_DEPLOYMENT_FAILED: 'MODEL_DEPLOYMENT_FAILED',
  
  // API related errors
  API_VALIDATION_FAILED: 'API_VALIDATION_FAILED',
  API_RATE_LIMIT_EXCEEDED: 'API_RATE_LIMIT_EXCEEDED',
  API_AUTHENTICATION_FAILED: 'API_AUTHENTICATION_FAILED',
  
  // Resource related errors
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
  RESOURCE_UNAVAILABLE: 'RESOURCE_UNAVAILABLE',
  
  // System errors
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // User input errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT'
};

export const handleError = (error: Error | AIError) => {
  // Convert to AIError if it's a regular Error
  const aiError = error instanceof AIError ? error : new AIError(
    error.message || 'An unknown error occurred',
    'UNKNOWN_ERROR',
    'error'
  );

  // Log error with context
  console.error(`[${aiError.code}] ${aiError.severity.toUpperCase()}: ${aiError.message}`, {
    timestamp: new Date().toISOString(),
    stack: aiError.stack,
    context: aiError.context
  });
  
  // Handle based on severity
  switch (aiError.severity) {
    case 'critical':
      // Stop all running processes and show error UI
      window.dispatchEvent(new CustomEvent('ai-error', {
        detail: {
          type: 'critical',
          message: aiError.message,
          code: aiError.code,
          context: aiError.context
        }
      }));
      break;
      
    case 'error':
      // Show error notification
      window.dispatchEvent(new CustomEvent('ai-error', {
        detail: {
          type: 'error',
          message: aiError.message,
          code: aiError.code,
          context: aiError.context
        }
      }));
      break;
      
    case 'warning':
      // Show warning notification
      window.dispatchEvent(new CustomEvent('ai-error', {
        detail: {
          type: 'warning',
          message: aiError.message,
          code: aiError.code,
          context: aiError.context
        }
      }));
      break;
  }

  // Return error for further handling if needed
  return aiError;
};

// Helper function to create specific error types
export const createError = (code: keyof typeof ErrorCodes, message: string, context?: Record<string, any>) => {
  const severity = code.startsWith('INVALID_') || code.startsWith('MISSING_') ? 'warning' : 'error';
  return new AIError(message, ErrorCodes[code], severity, context);
}; 