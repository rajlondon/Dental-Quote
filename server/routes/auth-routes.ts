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

    // Verify password
    console.log('Verifying password for user:', user.email);
    console.log('Password hash exists:', !!user.password_hash);
    console.log('Password hash length:', user.password_hash ? user.password_hash.length : 0);
    console.log('Input password:', password);

    if (!user.password_hash) {
      console.log('No password hash found - user needs to be recreated');
      return res.status(401).json({ 
        success: false, 
        message: 'Admin user not properly configured. Use /api/auth/recreate-admin' 
      });
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Bcrypt comparison result:', isValidPassword);

      // Additional debug
      if (!isValidPassword) {
        console.log('Password mismatch - checking hash details');
        console.log('Hash starts with:', user.password_hash.substring(0, 10));
        console.log('Expected password length:', password.length);
      }

    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({ 
        success: false, 
        message: 'Password verification failed: ' + bcryptError.message 
      });
    }

    console.log('Final password validation result:', isValidPassword);

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
    console.log('🔍 USER SESSION CHECK:', {
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID,
      hasSession: !!req.session,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      timestamp: new Date().toISOString()
    });

    if (!req.session.userId) {
      console.log('❌ NO USER SESSION - Not authenticated');
      return res.status(401).json({ 
        message: 'Not authenticated',
        debug: {
          hasSession: !!req.session,
          sessionId: req.sessionID,
          sessionKeys: req.session ? Object.keys(req.session) : []
        }
      });
    }

    console.log('🔍 FETCHING USER DATA for ID:', req.session.userId);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (user.length === 0) {
      console.log('❌ USER NOT FOUND in database for ID:', req.session.userId);
      return res.status(404).json({ 
        message: 'User not found',
        debug: {
          searchedUserId: req.session.userId,
          sessionId: req.sessionID
        }
      });
    }

    const userData = user[0];
    console.log('✅ USER DATA FOUND:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      firstName: userData.first_name,
      lastName: userData.last_name,
      emailVerified: userData.email_verified,
      status: userData.status
    });

    const responseData = {
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name,
        emailVerified: userData.email_verified,
        status: userData.status
      }
    };

    console.log('✅ RETURNING USER SESSION DATA:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('❌ GET USER SESSION ERROR:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      debug: {
        sessionId: req.sessionID,
        userId: req.session?.userId
      }
    });
  }
});

// General login endpoint for portal login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 LOGIN ATTEMPT:', {
      email: email,
      passwordProvided: !!password,
      passwordLength: password ? password.length : 0,
      timestamp: new Date().toISOString()
    });

    if (!email || !password) {
      console.log('❌ LOGIN FAILED: Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Query for user with any role
    console.log('🔍 SEARCHING FOR USER:', email);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log('👤 USER SEARCH RESULT:', {
      found: user.length > 0,
      userCount: user.length,
      userData: user.length > 0 ? {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
        hasPasswordHash: !!user[0].password_hash,
        passwordHashLength: user[0].password_hash ? user[0].password_hash.length : 0,
        emailVerified: user[0].email_verified,
        status: user[0].status
      } : null
    });

    if (user.length === 0) {
      console.log('❌ LOGIN FAILED: User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - user not found' 
      });
    }

    const userData = user[0];

    if (!userData.password_hash) {
      console.log('❌ LOGIN FAILED: No password hash for user');
      return res.status(401).json({ 
        success: false, 
        message: 'Account not properly configured' 
      });
    }

    // Verify password
    console.log('🔒 VERIFYING PASSWORD for user:', userData.email);
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, userData.password_hash);
      console.log('🔒 PASSWORD VERIFICATION RESULT:', {
        isValid: isValidPassword,
        inputPassword: password,
        hashExists: !!userData.password_hash,
        hashLength: userData.password_hash.length
      });
    } catch (bcryptError) {
      console.error('❌ BCRYPT ERROR:', bcryptError);
      return res.status(500).json({ 
        success: false, 
        message: 'Password verification failed' 
      });
    }

    if (!isValidPassword) {
      console.log('❌ LOGIN FAILED: Invalid password');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - wrong password' 
      });
    }

    // Create session
    console.log('✅ PASSWORD VALID - Creating session for user:', userData.email);
    req.session.userId = userData.id;
    req.session.userRole = userData.role;

    // Save session explicitly
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('❌ SESSION SAVE ERROR:', err);
          reject(err);
        } else {
          console.log('✅ SESSION SAVED successfully');
          resolve(true);
        }
      });
    });

    console.log('✅ USER SESSION CREATED:', {
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID,
      email: userData.email
    });

    // Return user data
    const responseData = {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name,
        emailVerified: userData.email_verified,
        status: userData.status
      }
    };

    console.log('✅ LOGIN SUCCESS - Returning user data:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
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

// Reset admin user with fresh password
router.post('/reset-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@mydentalfly.com';
    const adminPassword = 'Admin123!';

    console.log('Resetting admin user...');

    // Delete existing admin if exists
    await db
      .delete(users)
      .where(eq(users.email, adminEmail));

    // Create admin user with fresh password hash
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log('Creating admin with hashed password length:', hashedPassword.length);

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

    console.log('Successfully created admin user:', {
      email: newAdmin[0].email,
      role: newAdmin[0].role,
      hasPassword: !!newAdmin[0].password_hash
    });

    res.json({
      success: true,
      message: 'Admin user reset successfully',
      user: {
        email: newAdmin[0].email,
        role: newAdmin[0].role,
        hasPassword: !!newAdmin[0].password_hash
      }
    });

  } catch (error) {
    console.error('Reset admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset admin user',
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
        last_name: users.last_name,
        email_verified: users.email_verified,
        status: users.status,
        hasPassword: users.password_hash
      })
      .from(users);

    res.json({
      success: true,
      users: allUsers.map(user => ({
        ...user,
        hasPassword: !!user.hasPassword
      })),
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

// Create test patient account
router.post('/create-test-patient', async (req, res) => {
  try {
    const testEmail = 'patient@mydentalfly.co.uk';
    const testPassword = 'Patient123!';

    console.log('🧪 Creating test patient account:', testEmail);

    // Check if patient already exists
    const existingPatient = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    if (existingPatient.length > 0) {
      console.log('👤 Test patient already exists:', {
        id: existingPatient[0].id,
        email: existingPatient[0].email,
        role: existingPatient[0].role,
        firstName: existingPatient[0].first_name,
        lastName: existingPatient[0].last_name,
        hasPassword: !!existingPatient[0].password_hash,
        emailVerified: existingPatient[0].email_verified,
        status: existingPatient[0].status
      });

      // Test the existing password
      if (existingPatient[0].password_hash) {
        const isPasswordCorrect = await bcrypt.compare(testPassword, existingPatient[0].password_hash);
        console.log('🔒 Existing password test result:', isPasswordCorrect);
        
        if (!isPasswordCorrect) {
          console.log('🔄 Updating password for existing test patient');
          const hashedPassword = await bcrypt.hash(testPassword, 10);
          
          await db
            .update(users)
            .set({
              password_hash: hashedPassword,
              updated_at: new Date()
            })
            .where(eq(users.email, testEmail));
        }
      }

      return res.json({
        success: true,
        message: 'Test patient account already exists',
        user: {
          id: existingPatient[0].id,
          email: existingPatient[0].email,
          role: existingPatient[0].role,
          firstName: existingPatient[0].first_name,
          lastName: existingPatient[0].last_name,
          hasPassword: !!existingPatient[0].password_hash,
          passwordUpdated: !existingPatient[0].password_hash || !(await bcrypt.compare(testPassword, existingPatient[0].password_hash))
        }
      });
    }

    // Create test patient
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    console.log('🔐 Creating password hash for test patient, length:', hashedPassword.length);

    const newPatient = await db
      .insert(users)
      .values({
        email: testEmail,
        password_hash: hashedPassword,
        role: 'patient',
        first_name: 'Raj',
        last_name: 'Test',
        email_verified: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    console.log('✅ Test patient created successfully:', {
      id: newPatient[0].id,
      email: newPatient[0].email,
      role: newPatient[0].role,
      firstName: newPatient[0].first_name,
      lastName: newPatient[0].last_name,
      hasPassword: !!newPatient[0].password_hash
    });

    // Test the password immediately
    const testResult = await bcrypt.compare(testPassword, newPatient[0].password_hash);
    console.log('🧪 Immediate password test result:', testResult);

    res.json({
      success: true,
      message: 'Test patient account created successfully',
      user: {
        id: newPatient[0].id,
        email: newPatient[0].email,
        role: newPatient[0].role,
        firstName: newPatient[0].first_name,
        lastName: newPatient[0].last_name,
        hasPassword: !!newPatient[0].password_hash,
        passwordTest: testResult,
        credentials: {
          email: testEmail,
          password: testPassword
        }
      }
    });

  } catch (error) {
    console.error('❌ Create test patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test patient account',
      error: error.message
    });
  }
});

// Simple admin reset endpoint
router.post('/recreate-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@mydentalfly.com';
    const adminPassword = 'Admin123!';

    console.log('Recreating admin user...');

    // Delete ALL users with admin email
    const deletedCount = await db
      .delete(users)
      .where(eq(users.email, adminEmail));

    console.log('Deleted existing admin users:', deletedCount);

    // Create fresh hash
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    console.log('Generated fresh password hash, length:', hashedPassword.length);

    // Insert new admin
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

    console.log('Created fresh admin user:', {
      id: newAdmin[0].id,
      email: newAdmin[0].email,
      role: newAdmin[0].role,
      hasPassword: !!newAdmin[0].password_hash,
      passwordLength: newAdmin[0].password_hash?.length
    });

    // Test the password immediately
    const testResult = await bcrypt.compare(adminPassword, newAdmin[0].password_hash);
    console.log('Password test result:', testResult);

    res.json({
      success: true,
      message: 'Admin user recreated successfully',
      user: {
        id: newAdmin[0].id,
        email: newAdmin[0].email,
        role: newAdmin[0].role,
        hasPassword: !!newAdmin[0].password_hash,
        passwordTest: testResult
      }
    });

  } catch (error) {
    console.error('Recreate admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recreate admin user',
      error: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  console.log('🔥 ULTIMATE LOGOUT REQUEST: Complete session destruction for:', req.sessionID);

  // Get the session ID before destroying it
  const sessionId = req.sessionID;
  const isForceDestroy = req.body.forceDestroy === true;
  const isUltimateLogout = req.body.ultimateLogout === true;

  console.log('Force destroy requested:', isForceDestroy);
  console.log('Ultimate logout requested:', isUltimateLogout);

  // Immediately clear all session properties
  if (req.session) {
    Object.keys(req.session).forEach(key => {
      delete req.session[key];
    });
  }

  // Call passport logout first
  req.logout((logoutErr) => {
    if (logoutErr) {
      console.error('Passport logout error:', logoutErr);
    }

    // Destroy the session completely
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destroy error:', destroyErr);
      }

      // Clear session cookies with all possible variations
      const cookieNames = ['connect.sid', 'session', 'sessionId', 'auth-token', 'user-session'];
      const cookieOptions = [
        { path: '/', httpOnly: true, secure: false, sameSite: 'lax' as const },
        { path: '/', httpOnly: false, secure: false, sameSite: 'lax' as const },
        { path: '/api', httpOnly: true, secure: false, sameSite: 'lax' as const },
        { path: '/auth', httpOnly: true, secure: false, sameSite: 'lax' as const },
        { path: '/', domain: req.hostname, httpOnly: true, secure: false, sameSite: 'lax' as const },
        { path: '/' }
      ];

      // Clear all cookie combinations
      cookieNames.forEach(cookieName => {
        cookieOptions.forEach(options => {
          res.clearCookie(cookieName, options);
        });
      });

      // Force set expired cookies as backup
      res.cookie('connect.sid', '', { expires: new Date(0), path: '/', httpOnly: true });
      res.cookie('session', '', { expires: new Date(0), path: '/', httpOnly: true });

      // Add nuclear headers to prevent ANY caching or persistence
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
        'X-Logout-Complete': 'true',
        'X-Session-Destroyed': sessionId,
        'Vary': '*'
      });

      console.log(`🧨 ULTIMATE LOGOUT COMPLETE: Session ${sessionId} completely destroyed`);
      
      res.status(200).json({ 
        success: true, 
        message: 'Ultimate logout completed - all session data destroyed',
        sessionDestroyed: true,
        sessionId: sessionId,
        timestamp: Date.now(),
        ultimateLogout: true,
        authDisabled: true
      });
    });
  });
});

export default router;