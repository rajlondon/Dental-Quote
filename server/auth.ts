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
  // Session middleware config
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "mydentalfly_dev_secret",
    resave: false,
    saveUninitialized: false,
    store: new PgSessionStore({
      pool, // Use the existing Neon pooled database connection
      tableName: 'session', // Default session table name
      createTableIfMissing: true, // Auto-create the session table if it doesn't exist
      pruneSessionInterval: 60 * 60 // Prune expired sessions every hour
    }),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for longer persistence
      sameSite: 'lax',
      path: '/'
    }
  };

  // Set up session and passport middlewares
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure LocalStrategy
  passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        // Find user by email
        const [user] = await db.select().from(users).where(eq(users.email, email));
        
        if (!user) {
          return done(null, false, { message: "Unknown user" });
        }
        
        // Check if user has a password
        if (!user.password) {
          return done(null, false, { message: "Password not set" });
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Check if email is verified for patients (admin and clinic users can bypass)
        if (user.role === 'patient' && user.status === 'pending' && !user.emailVerified) {
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
        return done(null, userForAuth);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
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
      
      done(null, userForAuth);
    } catch (err) {
      done(err);
    }
  });

  // Login endpoint with enhanced email verification handling and redirect support
  app.post("/api/auth/login", (req, res, next) => {
    // Log request info for debugging
    console.log("Login request received:", {
      contentType: req.headers['content-type'],
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
    });

    // Handle missing credentials
    if (!req.body.email || !req.body.password) {
      return res.status(401).json({ 
        success: false, 
        message: "Missing credentials"
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
        
        // Set additional role-specific HTTP-only cookies to enhance session persistence
        const cookieOptions = {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          path: '/',
          secure: process.env.NODE_ENV === "production"
        };
        
        // Set role-specific session cookies
        if (user.role === 'admin') {
          res.cookie('admin_auth', 'true', cookieOptions);
          res.cookie('admin_session_id', user.id.toString(), cookieOptions);
          res.cookie('portal_type', 'admin', cookieOptions);
        } else if (user.role === 'clinic_staff' || user.role === 'clinic') {
          res.cookie('clinic_auth', 'true', cookieOptions);
          res.cookie('clinic_session_id', user.id.toString(), cookieOptions);
          res.cookie('portal_type', 'clinic', cookieOptions);
        } else {
          res.cookie('patient_auth', 'true', cookieOptions);
          res.cookie('patient_session_id', user.id.toString(), cookieOptions);
          res.cookie('portal_type', 'patient', cookieOptions);
        }
        
        // Set a global auth cookie for more persistent routing
        res.cookie('mdf_authenticated', 'true', cookieOptions);
        res.cookie('mdf_user_id', user.id.toString(), cookieOptions);
        res.cookie('mdf_user_role', user.role, cookieOptions);
        
        console.log("Set enhanced session cookies for user:", user.id, user.role);
        
        // Check if redirect parameter is provided
        // This allows for direct form-based login with redirect
        const redirect = req.body.redirect;
        if (redirect && typeof redirect === 'string') {
          // Only allow redirects to specific portal routes
          const allowedRedirects = ['/admin-portal', '/clinic-portal', '/client-portal'];
          if (allowedRedirects.includes(redirect)) {
            console.log(`Redirecting after login to: ${redirect}`);
            return res.redirect(redirect);
          }
        }
        
        // Include unverified status warning in the response if needed
        if (user.role === 'patient' && !user.emailVerified) {
          return res.json({ 
            success: true, 
            user,
            warnings: ["Your email is not verified. Some features may be limited."]
          });
        }
        
        return res.json({ success: true, user });
      });
    })(req, res, next);
  });

  // Logout endpoint with enhanced cookie clearing
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ success: false, message: "Logout failed" });
      
      // Clear all of our auth cookies
      const cookieOptions = {
        httpOnly: true,
        path: '/',
        expires: new Date(0), // Expire immediately
        secure: process.env.NODE_ENV === "production"
      };
      
      // Clear role-specific cookies
      res.cookie('admin_auth', '', cookieOptions);
      res.cookie('admin_session_id', '', cookieOptions);
      res.cookie('clinic_auth', '', cookieOptions);
      res.cookie('clinic_session_id', '', cookieOptions);
      res.cookie('patient_auth', '', cookieOptions);
      res.cookie('patient_session_id', '', cookieOptions);
      
      // Clear portal type cookie
      res.cookie('portal_type', '', cookieOptions);
      
      // Clear global auth cookies
      res.cookie('mdf_authenticated', '', cookieOptions);
      res.cookie('mdf_user_id', '', cookieOptions);
      res.cookie('mdf_user_role', '', cookieOptions);
      
      // Clear all cookies with same options but different paths
      ['/admin-portal', '/clinic-portal', '/client-portal'].forEach(path => {
        const pathOptions = {...cookieOptions, path};
        res.cookie('admin_auth', '', pathOptions);
        res.cookie('clinic_auth', '', pathOptions);
        res.cookie('patient_auth', '', pathOptions);
        res.cookie('mdf_authenticated', '', pathOptions);
      });
      
      console.log("All authentication cookies cleared");
      
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Current user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    res.json({ success: true, user: req.user });
  });
  
  // Debug endpoint to test auth flow - only in development
  app.post("/api/auth/debug-login", (req, res) => {
    console.log("Debug login request:", {
      body: req.body,
      headers: {
        contentType: req.headers['content-type'],
        cookie: req.headers.cookie
      }
    });
    
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Missing email or password",
        received: {
          hasEmail: !!req.body.email,
          hasPassword: !!req.body.password,
          contentType: req.headers['content-type']
        }
      });
    }
    
    res.json({
      success: true,
      message: "Debug login endpoint received data correctly",
      email: req.body.email
    });
  });
  
  // Special redirect routes that can be used after login
  app.get("/api/auth/redirect-to-admin", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated. Please log in first.");
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).send("Access denied. You don't have admin permissions.");
    }
    
    console.log("Redirecting authenticated admin user to admin portal via intermediate page");
    res.redirect("/admin-portal-redirect.html");
  });
  
  app.get("/api/auth/redirect-to-clinic", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated. Please log in first.");
    }
    
    if (req.user.role !== 'clinic' && req.user.role !== 'clinic_staff') {
      return res.status(403).send("Access denied. You don't have clinic permissions.");
    }
    
    console.log("Redirecting authenticated clinic user to auto-login page");
    res.redirect("/clinic-auto.html");
  });
  
  app.get("/api/auth/redirect-to-patient", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated. Please log in first.");
    }
    
    if (req.user.role !== 'patient') {
      return res.status(403).send("Access denied. You don't have patient permissions.");
    }
    
    console.log("Redirecting authenticated patient user to patient portal via intermediate page");
    res.redirect("/patient-portal-redirect.html");
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