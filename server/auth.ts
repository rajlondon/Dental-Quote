import { Express } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import memorystore from "memorystore";

// Create memory store for sessions
const MemoryStore = memorystore(session);

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
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

  // Login endpoint with enhanced email verification handling
  app.post("/api/auth/login", (req, res, next) => {
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
        
        return res.json({ success: true, user });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ success: false, message: "Logout failed" });
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