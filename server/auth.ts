import { Express } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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
      secure: false, // Set to false for development
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

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user session for ID: ${id}`);

      const [user] = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImage: users.profileImage,
        clinicId: users.clinicId,
        emailVerified: users.emailVerified,
        status: users.status
      }).from(users).where(eq(users.id, id));

      if (!user) {
        console.warn(`Session references non-existent user ID: ${id}`);
        return done(null, false);
      }

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

      console.log(`Successfully deserialized user ${user.id} with role ${user.role}`);
      done(null, userForAuth);
    } catch (err) {
      console.error("Session deserialization error:", err);
      done(null, false);
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    console.log('Login attempt for:', req.body.email);

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user exists and password is correct
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.password) {
        console.log('User has no password set:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check email verification for patients
      if (user.role === 'patient' && !user.emailVerified) {
        console.log('Email not verified for patient:', email);
        return res.status(403).json({ 
          message: 'Please verify your email before logging in',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email
        });
      }

      // Login the user using Passport
      req.login(user, (err) => {
        if (err) {
          console.error('Passport login error:', err);
          return res.status(500).json({ message: 'Login failed' });
        }

        console.log('Login successful for:', email, 'Role:', user.role);

        // Create user response object
        const userResponse = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          profileComplete: user.profileComplete,
          status: user.status,
          clinicId: user.clinicId,
          profileImage: user.profileImage
        };

        res.json({
          success: true,
          user: userResponse
        });
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout endpoint
    app.post("/api/auth/logout", (req, res) => {
    // Get user ID before logout to clear from cache
    const userId = req.user?.id;

    req.logout((err) => {
      if (err) return res.status(500).json({ success: false, message: "Logout failed" });

  // Google OAuth routes
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/portal-login?error=google_auth_failed' }),
    (req, res) => {
      // Successful authentication, redirect based on user role
      const user = req.user as any;

      if (user.role === 'admin') {
        res.redirect('/admin-dashboard');
      } else if (user.role === 'clinic_staff') {
        res.redirect('/clinic-dashboard');
      } else {
        res.redirect('/patient-dashboard');
      }
    }
  );

      // Clear user from session cache if we have the ID
      if (userId && userSessionCache.has(userId)) {
        userSessionCache.delete(userId);
        console.log(`Cleared user ${userId} from session cache on logout`);
      }

      // Destroy the session completely
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }

        // Clear the session cookie
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        res.json({ success: true, message: "Logged out successfully" });
      });
    });
  });

  // Current user endpoint
  app.get("/api/auth/user", (req: any, res) => {
    console.log('=== AUTH USER ENDPOINT ===');
    console.log('isAuthenticated:', req.isAuthenticated());
    console.log('User:', req.user ? `${req.user.email} (${req.user.role})` : 'NONE');
    console.log('Session ID:', req.sessionID);

    if (!req.isAuthenticated() || !req.user) {
      console.log('❌ Not authenticated, returning 401');
      return res.status(401).json({ error: 'Not authenticated', user: null });
    }

    const user = req.user;
    console.log('✅ Returning authenticated user:', user.email, 'Role:', user.role);
    
    res.json({ user: user });
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
        role: "clinic",
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

    // Check if test admin user exists
    const [testAdminExists] = await db.select().from(users).where(eq(users.email, "test@mydentalfly.co.uk"));

    if (!testAdminExists) {
      const testAdminPassword = await bcrypt.hash("Test123!", 10);
      await db.insert(users).values({
        email: "test@mydentalfly.co.uk",
        password: testAdminPassword,
        firstName: "Test",
        lastName: "Admin",
        role: "admin",
        emailVerified: true,
        profileComplete: true,
        status: "active"
      });
      console.log("✅ Created test admin user: test@mydentalfly.co.uk (password: Test123!)");
    } else {
      console.log("ℹ️ Test admin user already exists");
      // Update existing user to ensure admin role
      await db.update(users)
        .set({ role: "admin", emailVerified: true, profileComplete: true, status: "active" })
        .where(eq(users.email, "test@mydentalfly.co.uk"));
      console.log("✅ Updated test admin user role");
    }
  } catch (error) {
    console.error("Error seeding users:", error);
    // Don't throw the error, just log it and continue
    console.log("ℹ️ The application will continue without seeded users");
  }
}