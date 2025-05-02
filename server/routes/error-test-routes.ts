/**
 * Error Test Routes
 * 
 * Routes for testing the error handling system. Only available in development mode.
 */
import { Router } from 'express';
import { AppError, catchAsync } from '../middleware/error-handler';

// Create a router for the error test routes
const router = Router();

// Test route for 400 Bad Request errors
router.get('/400', (req, res) => {
  throw new AppError('Bad Request - This is a test error', 400, {
    errorCode: 'TEST_BAD_REQUEST',
    field: 'testField',
    reason: 'Invalid input for testing'
  });
});

// Test route for 401 Unauthorized errors
router.get('/401', (req, res) => {
  throw new AppError('Unauthorized - This is a test error', 401, {
    errorCode: 'TEST_UNAUTHORIZED',
    reason: 'Authentication required for testing'
  });
});

// Test route for 403 Forbidden errors
router.get('/403', (req, res) => {
  throw new AppError('Forbidden - This is a test error', 403, {
    errorCode: 'TEST_FORBIDDEN',
    reason: 'Insufficient permissions for testing'
  });
});

// Test route for 404 Not Found errors
router.get('/404', (req, res) => {
  throw new AppError('Not Found - This is a test error', 404, {
    errorCode: 'TEST_NOT_FOUND',
    resource: 'TestResource',
    id: '12345'
  });
});

// Test route for 500 Internal Server Error
router.get('/500', (req, res) => {
  throw new AppError('Internal Server Error - This is a test error', 500, {
    errorCode: 'TEST_SERVER_ERROR',
    reason: 'Server error simulation for testing'
  });
});

// Test route for async error handling with the catchAsync wrapper
router.get('/async-error', catchAsync(async (req, res) => {
  // Simulate an asynchronous operation that fails
  await new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Async operation failed - This is a test error'));
    }, 100);
  });
  
  res.json({ success: true }); // This line should never execute
}));

// Test route for unhandled rejection
router.get('/unhandled', (req, res) => {
  // This will cause an unhandled rejection which should be caught by our error handling middleware
  Promise.reject(new Error('Unhandled rejection - This is a test error'));
  
  // Send a response (this will still execute since the rejection is unhandled)
  res.json({ success: true, message: 'Response sent, but error was thrown' });
});

// Test route for validation errors
router.post('/validation', (req, res) => {
  const { username, email } = req.body;
  
  const errors = [];
  
  if (!username) {
    errors.push({ field: 'username', message: 'Username is required' });
  }
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (errors.length > 0) {
    throw new AppError('Validation Error - This is a test error', 422, {
      errorCode: 'TEST_VALIDATION_ERROR',
      validationErrors: errors
    });
  }
  
  res.json({ success: true, message: 'Validation passed' });
});

export default router;