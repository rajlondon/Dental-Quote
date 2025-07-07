import { Router } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "../../shared/schema";
import { and, eq } from "drizzle-orm";

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

    console.log('Admin login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Query for admin user - first check if user exists at all
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log('Found user with email:', allUsers.length > 0 ? allUsers[0] : 'None');

    if (allUsers.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - user not found' 
      });
    }

    const user = allUsers[0];
    
    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('User role is:', user.role, 'but admin required');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - not admin' 
      });
    }

    // Verify password - handle both hashed and plain text passwords for testing
    let isValidPassword = false;
    
    if (user.password_hash) {
      // Try bcrypt first
      try {
        isValidPassword = await bcrypt.compare(password, user.password_hash);
      } catch (bcryptError) {
        console.log('Bcrypt comparison failed, trying plain text comparison');
        // Fallback to plain text comparison for development/testing
        isValidPassword = password === user.password_hash;
      }
    }

    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - wrong password' 
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

    console.log('Admin session created successfully:', {
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

// General user session endpoint (for compatibility)
router.get('/user', async (req, res) => {
  try {
    console.log('User session check:', {
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID
    });

    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user[0];
    console.log('User data found:', {
      id: userData.id,
      email: userData.email,
      role: userData.role
    });

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// General login endpoint for portal login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Query for user with any role
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const userData = user[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Create session
    req.session.userId = userData.id;
    req.session.userRole = userData.role;

    // Save session explicitly
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    console.log('User session created:', {
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID
    });

    // Return user data
    res.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Create admin user for testing (remove in production)
router.post('/create-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@mydentalfly.com';
    const adminPassword = 'Admin123!';
    
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          email: existingAdmin[0].email,
          role: existingAdmin[0].role
        }
      });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const newAdmin = await db
      .insert(users)
      .values({
        email: adminEmail,
        password_hash: hashedPassword,
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    console.log('Created admin user:', newAdmin[0]);
    
    res.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        email: newAdmin[0].email,
        role: newAdmin[0].role
      }
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
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

// Debug endpoint to check users (remove in production)
router.get('/debug-users', async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        first_name: users.first_name,
        last_name: users.last_name
      })
      .from(users);
    
    res.json({
      success: true,
      users: allUsers,
      total: allUsers.length
    });
    
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    console.log('Logout request for session:', req.sessionID);
    
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to logout'
        });
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      
      console.log('Session destroyed successfully');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

export default router;