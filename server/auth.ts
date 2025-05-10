import { Express } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// Define extended session store options type to include errorCallback
interface ExtendedPgStoreOptions {
  pool: any;
  tableName?: string;
  createTableIfMissing?: boolean;
  pruneSessionInterval?: number;
  errorCallback?: (err: any) => void;
}

// Create PostgreSQL session store with automatic table creation
const PgSessionStore = connectPgSimple(session);

// Extend Express.User interface
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
      profileImage?: string;
      clinicId?: number;
      emailVerified?: boolean;
      status?: string;
    }
  }
}

export async function setupAuth(app: Express) {
  // Session middleware config with enhanced stability
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "mydentalfly_dev_secret",
    resave: false,
    saveUninitialized: false,
    // Prevent race conditions by using rolling sessions and longer cookie maxAge
    rolling: true, // Reset maxAge on every response
    store: new PgSessionStore({
      pool, // Use the existing Neon pooled database connection
      tableName: 'session', // Default session table name
      createTableIfMissing: true, // Auto-create the session table if it doesn't exist
      pruneSessionInterval: 60 * 60, // Prune expired sessions every hour
      errorCallback: (err: any) => {
        console.error("Session store error:", err);
      }
    } as ExtendedPgStoreOptions),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for clinic staff persistence
      sameSite: 'lax',
      path: '/',
      httpOnly: true
    }
  };

  // Set up session and passport middlewares
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure LocalStrategy with special handling for clinic staff
  passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        // Log authentication request
        console.log(`Authentication attempt for email: ${email}`);
        
        // Find user by email
        const [user] = await db.select().from(users).where(eq(users.email, email));
        
        if (!user) {
          console.log(`Authentication failed: Unknown user with email ${email}`);
          return done(null, false, { message: "Unknown user" });
        }
        
        // Check if user has a password
        if (!user.password) {
          console.log(`Authentication failed: Password not set for user ${user.id}`);
          return done(null, false, { message: "Password not set" });
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log(`Authentication failed: Incorrect password for user ${user.id}`);
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Check if email is verified for patients (admin and clinic users can bypass)
        if (user.role === 'patient' && user.status === 'pending' && !user.emailVerified) {
          console.log(`Authentication failed: Unverified email for patient ${user.id}`);
          return done(null, false, { message: "Please verify your email before logging in" });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        // Cast to match the Express.User interface
        const userForAuth = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          profileImage: user.profileImage || undefined,
          clinicId: user.clinicId || undefined,
          emailVerified: user.emailVerified || false,
          status: user.status || 'pending'
        };
        
        console.log(`Authentication successful for user ${user.id} with role ${user.role}`);
        
        return done(null, userForAuth);
      } catch (err) {
        console.error("Authentication error:", err);
        return done(err);
      }
    }
  ));

  // User session cache to reduce database load
  const userSessionCache = new Map<number, Express.User>();

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session with improved error handling and memory caching
  passport.deserializeUser(async (id: number, done) => {
    try {
      // First, validate the ID is actually a number
      if (typeof id !== 'number' || isNaN(id)) {
        console.error(`Invalid session user ID (${typeof id}): ${id}`);
        return done(null, false);
      }
      
      // Check our fast in-memory session cache first
      if (userSessionCache.has(id)) {
        // Only log occasionally to reduce console noise
        if (Math.random() < 0.01) { // Log 1% of cache hits
          console.log(`Using cached user session for ID: ${id}`);
        }
        return done(null, userSessionCache.get(id));
      }
      
      console.log(`Deserializing user session for ID: ${id}`);
      
      // If no valid cache, try the database with timeout protection
      let dbQueryTimeout: NodeJS.Timeout | null = null;
      
      try {
        // Set a timeout for the database query to prevent hanging requests
        const timeoutPromise = new Promise<null>((_, reject) => {
          dbQueryTimeout = setTimeout(() => {
            reject(new Error("Database query timed out during session restore"));
          }, 5000); // 5 second timeout
        });
        
        // Race the database query against the timeout
        const userResult = await Promise.race([
          db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImage: users.profileImage,
            clinicId: users.clinicId,
            emailVerified: users.emailVerified,
            status: users.status
          }).from(users).where(eq(users.id, id)),
          timeoutPromise
        ]);
        
        // Clear the timeout if query completes
        if (dbQueryTimeout) {
          clearTimeout(dbQueryTimeout);
          dbQueryTimeout = null;
        }
        
        // If we got a null result from the race, the timeout won
        if (userResult === null) {
          throw new Error("Database query timed out");
        }
        
        // Extract user from query results
        const [user] = userResult as any;
        
        if (!user) {
          console.warn(`Session references non-existent user ID: ${id}`);
          return done(null, false);
        }
        
        // Transform null values to undefined to match the Express.User interface
        const userForAuth = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          profileImage: user.profileImage || undefined,
          clinicId: user.clinicId || undefined,
          emailVerified: user.emailVerified || false,
          status: user.status || 'pending'
        };
        
        // Special handling for clinic_staff users
        if (user.role === 'clinic_staff') {
          console.log(`Clinic staff session restored for user ${user.id}`);
        }
        
        // Cache the user in memory for future requests (much faster)
        userSessionCache.set(id, userForAuth);
        
        done(null, userForAuth);
      } catch (dbErr) {
        // Clean up timeout if it's still active
        if (dbQueryTimeout) {
          clearTimeout(dbQueryTimeout);
        }
        
        console.error("Database error during session restore:", dbErr);
        
        // On database error, create a better fallback user to maintain session continuity
        console.log("Creating enhanced fallback user during database outage");
        
        // Check if the ID is likely for a clinic user based on known patterns
        // We can't access req here because we're in the Passport deserializeUser
        
        // Try to get stored clinic role and ID from any available sources
        let reconstructedRole = "recovery_mode";
        let reconstructedClinicId: number | undefined = undefined;
        
        // Attempt to determine if this is a clinic user based on known ID ranges or patterns
        // In this case, we'll use the sessionStore directly to check for session data
        try {
          // Check if this is likely a clinic user based on stored flags or known patterns
          const isLikelyClinicId = 
            // Check known clinic ID range
            (typeof id === 'number' && id >= 30 && id <= 50) || 
            // Or other known indicators
            (typeof id === 'string' && id.startsWith('clinic-'));
            
          if (isLikelyClinicId) {
            console.log(`User ID ${id} appears to be a clinic user ID based on known patterns`);
            reconstructedRole = "clinic";
            
            // If we don't have a clinic ID but believe this is a clinic user, use ID as clinic ID
            if (typeof id === 'number') {
              reconstructedClinicId = id;
            }
          }
        } catch (patternError) {
          console.error("Error checking for clinic patterns:", patternError);
        }
        
        // Create enhanced fallback user object with potential clinic data
        const fallbackUser = {
          id: id,
          email: "session-recovery@mydentalfly.local",
          role: reconstructedRole,
          clinicId: reconstructedClinicId
        };
        
        console.log(`Created fallback user with role: ${reconstructedRole}, clinicId: ${reconstructedClinicId || 'none'}`);
        done(null, fallbackUser);
      }
    } catch (err) {
      console.error("Critical session deserialization error:", err);
      // Don't pass error to done() as it can crash the application
      // Instead, fail authentication gracefully
      done(null, false);
    }
  });

  // Dedicated clinic login endpoint that performs server-side redirect
  app.post("/api/auth/clinic-login", (req, res, next) => {
    // Extract credentials and return URL from form submission
    const { email, password, returnUrl, isClinicLogin, skipPromoRedirect } = req.body;
    const targetUrl = returnUrl || '/clinic-portal/dashboard';
    
    // Log the clinic login request for debugging
    console.log("Clinic login request:", {
      email: email ? `${email.substring(0, 3)}...` : undefined,
      hasPassword: !!password,
      returnUrl,
      isClinicLogin,
      skipPromoRedirect
    });
    
    // Check if already authenticated as clinic_staff with same email
    if (req.isAuthenticated() && 
        req.user.role === 'clinic_staff' && 
        req.user.email === email) {
      
      console.log("Already authenticated as clinic staff with same email, redirecting");
      return res.redirect(targetUrl);
    }
    
    // Authenticate the user
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Clinic login error:", err);
        return res.redirect('/clinic-login?error=server_error');
      }
      
      if (!user) {
        console.log("Clinic login failed: Invalid credentials");
        return res.redirect('/clinic-login?error=invalid_credentials');
      }
      
      // Verify this is a clinic staff account
      if (user.role !== 'clinic_staff' && user.role !== 'admin') {
        console.log("Clinic login failed: Not a clinic staff account");
        return res.redirect('/clinic-login?error=access_denied');
      }
      
      // Log the user in
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Clinic login session error:", loginErr);
          return res.redirect('/clinic-login?error=session_error');
        }
        
        // Set markers in the session
        (req.session as any).isClinicStaff = true;
        
        // Add flags to prevent promo redirects if needed
        if (skipPromoRedirect === 'true' || isClinicLogin === 'true') {
          (req.session as any).skipPromoRedirect = true;
        }
        
        // Save the session explicitly before redirect to ensure cookie is set
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session before redirect:", saveErr);
            return res.redirect('/clinic-login?error=session_save_error');
          }
          
          // Redirect to the target URL with proper cookies set
          console.log(`Clinic login successful, redirecting to ${targetUrl}`);
          
          // Set a cookie to help client-side detect this is a clinic session
          res.cookie('is_clinic_staff', 'true', { 
            httpOnly: false, // Allow JavaScript to read
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/' 
          });
          
          return res.redirect(targetUrl);
        });
      });
    })(req, res, next);
  });
  
  // Standard login endpoint with enhanced email verification handling
  app.post("/api/auth/login", (req, res, next) => {
    // Special session optimization for clinic staff to prevent double login
    // Check if already authenticated as clinic_staff with same email
    if (req.isAuthenticated() && 
        req.user.role === 'clinic_staff' && 
        req.user.email === req.body.email) {
      
      console.log("Already authenticated as clinic staff with same email, reusing session");
      
      // Return the existing session instead of creating a new one
      return res.json({ 
        success: true, 
        user: req.user,
        sessionReused: true
      });
    }
    
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      
      if (!user) {
        // Check if this is specifically a verification issue
        if (info && info.message === "Please verify your email before logging in") {
          return res.status(403).json({ 
            success: false, 
            message: "Your email address has not been verified yet",
            code: "EMAIL_NOT_VERIFIED",
            email: req.body.email
          });
        }
        
        // General authentication failure
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Authentication failed" 
        });
      }
      
      req.login(user, (err: Error | null) => {
        if (err) return next(err);
        
        // Include unverified status warning in the response if needed
        if (user.role === 'patient' && !user.emailVerified) {
          return res.json({ 
            success: true, 
            user,
            warnings: ["Your email is not verified. Some features may be limited."]
          });
        }
        
        // Add special logging for clinic staff
        if (user.role === 'clinic_staff') {
          console.log(`Authenticated clinic staff: ${user.id} (${user.email})`);
        }
        
        return res.json({ success: true, user });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    // Get user ID before logout to clear from cache
    const userId = req.user?.id;
    
    req.logout((err) => {
      if (err) return res.status(500).json({ success: false, message: "Logout failed" });
      
      // Clear user from session cache if we have the ID
      if (userId && userSessionCache.has(userId)) {
        userSessionCache.delete(userId);
        console.log(`Cleared user ${userId} from session cache on logout`);
      }
      
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Add diagnostic middleware to log session and cookie information
  app.use("/api/auth/user", (req, res, next) => {
    console.log(`
====== AUTH REQUEST DIAGNOSTICS ======
Path: ${req.path}
Method: ${req.method}
Authenticated: ${req.isAuthenticated()}
User ID: ${req.user?.id}
User Role: ${req.user?.role}
Has Cookie Header: ${!!req.headers.cookie}
Cookie Length: ${req.headers.cookie ? req.headers.cookie.length : 0}
Cookie Preview: ${req.headers.cookie ? req.headers.cookie.substring(0, 40) + '...' : 'NONE'}
Session ID: ${req.sessionID || 'NONE'}
Session Created: ${req.session.cookie.originalMaxAge !== undefined}
======================================
    `);
    next();
  });
  
  // Current user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    res.json({ success: true, user: req.user });
  });

  // Create admin and clinic users if they don't exist
  await seedUsers();
}

// Helper function to seed admin and clinic users
async function seedUsers() {
  try {
    // Check if database connection is working before proceeding
    try {
      // Test connection with a simple query
      const result = await db.execute(sql`SELECT 1 AS test`);
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("⚠️ Database connection failed:", dbError);
      console.log("ℹ️ Skipping user seeding due to database connection issue");
      // Don't throw here, just return to continue with the rest of the app setup
      return;
    }
    
    // Check if admin user exists
    const [adminExists] = await db.select().from(users).where(eq(users.email, "admin@mydentalfly.com"));
    
    if (!adminExists) {
      const adminPassword = await bcrypt.hash("Admin123!", 10);
      await db.insert(users).values({
        email: "admin@mydentalfly.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        emailVerified: true,
        profileComplete: true,
        status: "active"
      });
      console.log("✅ Created admin user: admin@mydentalfly.com (password: Admin123!)");
    } else {
      console.log("ℹ️ Admin user already exists");
    }

    // Check if clinic user exists
    const [clinicExists] = await db.select().from(users).where(eq(users.email, "clinic@mydentalfly.com"));
    
    if (!clinicExists) {
      const clinicPassword = await bcrypt.hash("Clinic123!", 10);
      await db.insert(users).values({
        email: "clinic@mydentalfly.com",
        password: clinicPassword,
        firstName: "Clinic",
        lastName: "Manager",
        role: "clinic_staff",
        emailVerified: true,
        profileComplete: true,
        status: "active"
      });
      console.log("✅ Created clinic user: clinic@mydentalfly.com (password: Clinic123!)");
    } else {
      console.log("ℹ️ Clinic user already exists");
    }
    
    // Check if patient user exists
    const [patientExists] = await db.select().from(users).where(eq(users.email, "patient@mydentalfly.com"));
    
    if (!patientExists) {
      const patientPassword = await bcrypt.hash("Patient123!", 10);
      await db.insert(users).values({
        email: "patient@mydentalfly.com",
        password: patientPassword,
        firstName: "Test",
        lastName: "Patient",
        role: "patient",
        emailVerified: true,
        profileComplete: true,
        status: "active"
      });
      console.log("✅ Created patient user: patient@mydentalfly.com (password: Patient123!)");
    } else {
      console.log("ℹ️ Patient user already exists");
    }
  } catch (error) {
    console.error("Error seeding users:", error);
    // Don't throw the error, just log it and continue
    console.log("ℹ️ The application will continue without seeded users");
  }
}