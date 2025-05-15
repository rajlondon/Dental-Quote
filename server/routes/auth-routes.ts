import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { db } from '../db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { type Session } from 'express-session';
import { 
  getSessionConfig,
  requireAuthentication,
  logAuthDiagnostics,
  serializeUserForSession,
  sendLoginResponse,
  handleLogout,
  requireRole
} from '../utils/auth-utils';

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
enhancedAuthRoutes.get('/status', (req: Request, res: Response) => {
  const authStatus = {
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null,
    sessionID: req.sessionID,
    cookies: req.headers.cookie ? true : false
  };
  
  res.json(authStatus);
});

// Enhanced login endpoint with better error handling and shared utility functions
enhancedAuthRoutes.post('/login', (req: Request, res: Response, next: NextFunction) => {
  // Log detailed authentication diagnostics
  logAuthDiagnostics(req, 'LOGIN_ATTEMPT');
  
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
    
    // Log the login attempt with more detailed user information
    console.log(`Login attempt successful for user ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    
    // Configure session for better persistence using shared utility
    configureSessionForPersistence(req);
    
    // Manually handle login to have more control
    req.login(user, (loginErr: Error | null) => {
      if (loginErr) {
        console.error('Session error during login:', loginErr);
        return res.status(500).json({ success: false, message: 'Failed to establish session', error: loginErr.message });
      }
      
      // Force session save to ensure cookie is set
      req.session.save((saveErr: Error | null) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ success: false, message: 'Failed to save session', error: saveErr.message });
        }
        
        // Set role-specific cookies using shared utility
        setRoleSpecificCookies(req, res, user);
        
        // Use standardized login response utility
        sendLoginResponse(req, res, user);
      });
    });
  })(req, res, next);
});

// Enhanced register endpoint
enhancedAuthRoutes.post('/register', async (req: Request, res: Response) => {
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
    // Create a properly typed user object with null values converted to undefined
    const userForLogin: User = {
      ...newUser,
      // Convert null values to undefined for fields that are defined in User type
      firstName: newUser.firstName ?? undefined,
      lastName: newUser.lastName ?? undefined,
      phone: newUser.phone ?? undefined,
      profileImage: newUser.profileImage ?? undefined,
      address: newUser.address ?? undefined,
      dateOfBirth: newUser.dateOfBirth ?? undefined,
      nationality: newUser.nationality ?? undefined,
      preferredLanguage: newUser.preferredLanguage ?? "English",
      passportNumber: newUser.passportNumber ?? undefined,
      emergencyContact: newUser.emergencyContact ?? undefined,
      medicalInfo: newUser.medicalInfo ?? undefined,
      jobTitle: newUser.jobTitle ?? undefined,
      status: newUser.status ?? undefined
    };
    
    // Configure session for better persistence using shared utility
    configureSessionForPersistence(req);
    
    // Automatically log in the new user
    req.login(userForLogin, (err: Error | null) => {
      if (err) {
        console.error('Session error during auto-login after registration:', err);
        return res.status(201).json({ 
          success: true, 
          user: newUser,
          message: 'Registration successful, but auto-login failed. Please log in manually.'
        });
      }
      
      // Force session save
      req.session.save((saveErr: Error | null) => {
        if (saveErr) {
          console.error('Session save error after registration:', saveErr);
          return res.status(201).json({ 
            success: true, 
            user: newUser,
            message: 'Registration successful, but session save failed. Please log in manually.'
          });
        }
        
        // Set role-specific cookies using shared utility
        setRoleSpecificCookies(req, res, userForLogin);
        
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

// Enhanced logout endpoint with complete session destruction
enhancedAuthRoutes.post('/logout', (req: Request, res: Response) => {
  // Log detailed authentication diagnostics
  logAuthDiagnostics(req, 'LOGOUT_ATTEMPT');
  
  // Use standardized logout handling
  handleLogout(req, res);
});

export default enhancedAuthRoutes;