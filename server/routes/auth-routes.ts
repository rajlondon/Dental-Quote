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

// Admin login endpoint
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Query for admin user
    const adminUser = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, 'admin')))
      .limit(1);

    if (adminUser.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = adminUser[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Create session - ensure it's properly saved
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Save session explicitly to ensure it's persisted
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    console.log('Admin session created:', {
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID
    });

    // Return user data
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get admin user session
router.get('/admin-user', async (req, res) => {
  try {
    console.log('Admin user session check:', {
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID
    });

    if (!req.session.userId || req.session.userRole !== 'admin') {
      console.log('Admin session validation failed:', {
        hasUserId: !!req.session.userId,
        userRole: req.session.userRole
      });
      return res.status(401).json({ message: 'Not authenticated as admin' });
    }

    const adminUser = await db
      .select()
      .from(users)
      .where(and(eq(users.id, req.session.userId), eq(users.role, 'admin')))
      .limit(1);

    if (adminUser.length === 0) {
      console.log('Admin user not found in database for userId:', req.session.userId);
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const user = adminUser[0];
    console.log('Admin session validated successfully for user:', user.email);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    });

  } catch (error) {
    console.error('Get admin user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;