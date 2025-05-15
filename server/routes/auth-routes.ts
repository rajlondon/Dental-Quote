import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { db } from '../db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { type Session } from 'express-session';

// Extend the Session type to include passport
declare module 'express-session' {
  interface Session {
    passport?: {
      user: number;
    };
  }
}

const enhancedAuthRoutes = Router();

// Add an auth status endpoint that's more reliable
enhancedAuthRoutes.get('/status', (req, res) => {
  const authStatus = {
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null,
    sessionID: req.sessionID,
    cookies: req.headers.cookie ? true : false
  };
  
  res.json(authStatus);
});

// Enhanced login endpoint with better error handling
enhancedAuthRoutes.post('/login', (req, res, next) => {
  // Clear any potential stale session data
  if (req.session.passport) {
    delete req.session.passport;
  }
  
  passport.authenticate('local', (err: Error | null, user: User | false, info: { message?: string } | undefined) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ success: false, message: 'Authentication error', error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: info?.message || 'Invalid credentials' });
    }
    
    // Log the login attempt
    console.log(`Login attempt successful for user ${user.email} (${user.id})`);
    
    // Manually handle login to have more control
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Session error during login:', loginErr);
        return res.status(500).json({ success: false, message: 'Failed to establish session', error: loginErr.message });
      }
      
      // Force session save to ensure cookie is set
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ success: false, message: 'Failed to save session', error: saveErr.message });
        }
        
        // Set special-case cookies for clinic staff
        if (user.role === 'clinic_staff') {
          res.cookie('is_clinic_staff', 'true', { 
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: false, // Make accessible to client JS
            path: '/',
            sameSite: 'lax'
          });
          
          res.cookie('clinic_session_active', 'true', {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false,
            path: '/',
            sameSite: 'lax'
          });
        }
        
        // Return success with user object
        return res.json({ 
          success: true, 
          user,
          message: 'Login successful'
        });
      });
    });
  })(req, res, next);
});

// Enhanced register endpoint
enhancedAuthRoutes.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, consent = false } = req.body;
    
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user - using a properly typed approach
    const [newUser] = await db.insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'patient', // Default role is patient
        status: 'pending',
        emailVerified: false,
        phone: phone || null,
        gdprConsent: consent
      } as any) // Using 'any' temporarily to bypass type check until schema is updated
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        emailVerified: users.emailVerified,
        phone: users.phone
      });
    
    // Log the registration
    console.log(`New user registered: ${newUser.email} (${newUser.id})`);
    
    // Convert newUser to match User type expected by req.login
    const userForLogin = {
      ...newUser,
      // Convert null values to undefined to match User type
      firstName: newUser.firstName || undefined,
      lastName: newUser.lastName || undefined,
      status: newUser.status || undefined,
      phone: newUser.phone || undefined
    } as User;
    
    // Automatically log in the new user
    req.login(userForLogin, (err) => {
      if (err) {
        console.error('Session error during auto-login after registration:', err);
        return res.status(201).json({ 
          success: true, 
          user: newUser,
          message: 'Registration successful, but auto-login failed. Please log in manually.'
        });
      }
      
      // Force session save
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error after registration:', saveErr);
        }
        
        return res.status(201).json({ 
          success: true, 
          user: newUser,
          message: 'Registration successful'
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Failed to register user', error: errorMessage });
  }
});

// Enhanced logout endpoint
enhancedAuthRoutes.post('/logout', (req, res) => {
  const wasAuthenticated = req.isAuthenticated();
  const userId = req.user?.id;
  
  // Clear special cookies
  res.clearCookie('is_clinic_staff', { path: '/' });
  res.clearCookie('clinic_session_active', { path: '/' });
  res.clearCookie('no_promo_redirect', { path: '/' });
  res.clearCookie('disable_quote_redirect', { path: '/' });
  res.clearCookie('no_special_offer_redirect', { path: '/' });
  
  // Standard logout
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Failed to logout', error: err.message });
    }
    
    // Regenerate session for security
    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) {
        console.error('Session regeneration error during logout:', regenerateErr);
      }
      
      if (wasAuthenticated) {
        console.log(`User ${userId} logged out successfully`);
      }
      
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

export default enhancedAuthRoutes;