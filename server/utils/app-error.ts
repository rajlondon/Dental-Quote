/**
 * Custom application error class that extends the built-in Error class
 * Used for creating consistent error objects with status codes
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // This is a known operational error, not a programming error

    // Capture stack trace (exclude this constructor from stack trace)
    Error.captureStackTrace(this, this.constructor);
  }
}