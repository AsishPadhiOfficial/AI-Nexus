export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'warning' | 'error' | 'critical'
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export const handleError = (error: AIError) => {
  // Log error
  console.error(`[${error.code}] ${error.severity}: ${error.message}`);
  
  // Handle based on severity
  switch (error.severity) {
    case 'critical':
      // Stop all running processes
      break;
    case 'error':
      // Retry logic
      break;
    case 'warning':
      // Show warning notification
      break;
  }
}; 