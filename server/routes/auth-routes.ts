import { Router } from "express";
import passport from "passport";

const router = Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/portal-login?error=auth_failed',
    session: false 
  }),
  async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect('/portal-login?error=no_user');
      }

      // Set the session cookie
      res.cookie('session', user.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Redirect based on user role
      const redirectMap = {
        admin: '/admin-dashboard',
        clinic_staff: '/clinic-dashboard', 
        patient: '/patient-dashboard'
      };

      const redirectUrl = redirectMap[user.role as keyof typeof redirectMap] || '/patient-dashboard';
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/portal-login?error=callback_failed');
    }
  }
);

export default router;
