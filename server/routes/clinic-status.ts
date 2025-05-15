import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';

const clinicStatusRoutes = Router();

// Simple endpoint to get clinic status with user information
clinicStatusRoutes.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // If we reach here, the user is authenticated (checked by isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if the user is a clinic staff or admin
    if (req.user.role !== 'clinic_staff' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only clinic staff and admins can access this endpoint.'
      });
    }

    // Return the user data (from session)
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error: any) {
    console.error('Error in clinic status endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Diagnostic endpoint to check authentication status - doesn't require auth
clinicStatusRoutes.get('/check', async (req: Request, res: Response) => {
  // Log session information for debugging
  console.log('==== AUTH CHECK DIAGNOSTICS ====');
  console.log('Session ID:', req.sessionID);
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('Session data:', req.session);
  console.log('User:', req.user);
  console.log('Cookies:', req.cookies);
  console.log('==============================');
  
  // Return detailed auth status information
  return res.json({
    success: true,
    authenticated: req.isAuthenticated(),
    user: req.user || null,
    sessionID: req.sessionID,
    sessionExists: !!req.session,
    hasCookies: Object.keys(req.cookies || {}).length > 0,
    cookieCount: Object.keys(req.cookies || {}).length,
    // Don't send actual cookie values in response for security
    cookieNames: Object.keys(req.cookies || {})
  });
});

export default clinicStatusRoutes;