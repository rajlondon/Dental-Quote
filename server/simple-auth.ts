import { Router } from 'express';
import bcrypt from 'bcrypt';
import { storage } from './storage';

const router = Router();

// Simple register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'patient' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Check if user exists using storage
    try {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
      }
    } catch (error) {
      // User doesn't exist, which is what we want
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      email,
      passwordHash,
      firstName: firstName || '',
      lastName: lastName || '',
      role,
      emailVerified: true,
      status: 'active'
    };

    // Create user using storage
    const newUser = await storage.createUser(userData);
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Simple login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Get user using storage
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        clinicId: user.clinicId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
