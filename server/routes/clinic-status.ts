import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Simple endpoint to verify auth status and return basic clinic info
router.get('/clinic-status', isAuthenticated, async (req, res) => {
  try {
    // Check if user is authenticated and has proper role
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Check if user has proper role
    if (req.user.role !== 'clinic_staff' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access clinic portal'
      });
    }

    // Return basic user info and auth status
    return res.json({
      success: true,
      authStatus: {
        authenticated: true,
        userId: req.user.id,
        userRole: req.user.role,
        sessionId: req.sessionID,
        hasSession: !!req.session,
      },
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        clinicId: req.user.clinicId
      }
    });
  } catch (error) {
    console.error('Error in clinic status endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching clinic status'
    });
  }
});

export default router;