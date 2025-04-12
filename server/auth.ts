import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Extend Express Request with User type
declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

// Helper functions for password hashing and comparison
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure session middleware
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "istanbul-dental-smile-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // Use email instead of username
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Setup auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role = "patient" } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create a new user with hashed password
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json({ user: { ...user, password: undefined } });
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error during registration" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.json({ user: { ...user, password: undefined } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destruction error:", sessionErr);
        }
        res.clearCookie("connect.sid");
        return res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { password, ...userWithoutPassword } = req.user;
    return res.json({ user: userWithoutPassword });
  });

  // Admin-only endpoint to create initial demo users for testing
  app.post("/api/auth/create-demo-users", async (req, res) => {
    // Only allow this in development environment
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not allowed in production" });
    }

    try {
      // Check if we already have users
      const existingUsers = await storage.getAllUsers();
      if (existingUsers && existingUsers.length > 0) {
        return res.json({ 
          message: "Demo users already exist", 
          count: existingUsers.length 
        });
      }

      // Create some demo users with different roles
      const demoUsers = [
        {
          email: "admin@istanbuldentalsmile.co.uk",
          password: await hashPassword("admin123"),
          firstName: "Admin",
          lastName: "User",
          role: "admin",
        },
        {
          email: "clinic@istanbuldentalsmile.co.uk",
          password: await hashPassword("clinic123"),
          firstName: "Clinic",
          lastName: "Staff",
          role: "clinic_staff",
          clinicId: 1, // Will need to be updated after creating clinics
        },
        {
          email: "patient@example.com",
          password: await hashPassword("patient123"),
          firstName: "Test",
          lastName: "Patient",
          role: "patient",
        },
      ];

      // Create the users in the database
      const createdUsers = [];
      for (const user of demoUsers) {
        const createdUser = await storage.createUser(user);
        createdUsers.push(createdUser);
      }

      return res.status(201).json({ 
        message: "Demo users created successfully", 
        users: createdUsers.map(u => ({ ...u, password: undefined })) 
      });
    } catch (error) {
      console.error("Error creating demo users:", error);
      return res.status(500).json({ message: "Error creating demo users" });
    }
  });

  // Helper method to get all users (admin only)
  app.get("/api/auth/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const users = await storage.getAllUsers();
      return res.json({ 
        users: users.map(u => ({ ...u, password: undefined })) 
      });
    } catch (error) {
      console.error("Error getting users:", error);
      return res.status(500).json({ message: "Error getting users" });
    }
  });

  return app;
}