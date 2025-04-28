import express, { Router, Request, Response } from "express";
import { db } from "../db";
import { createVerificationToken } from "../services/email-service";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import passport from "passport";
import bcrypt from "bcrypt";

const router: Router = express.Router();

// Test route to send a verification email (ONLY available in development mode)
router.post("/test-verification-email", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    
    // Get user with email
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }
    
    // Create new verification token
    const verificationToken = await createVerificationToken(user.id, "email_verification");
    
    // Generate verification URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    // Format verification email data
    const userName = user.firstName || "User";
    const verificationData = {
      userEmail: user.email,
      userName: userName,
      verificationLink: verificationUrl
    };
    
    // Import and use the Mailjet service
    try {
      const { sendVerificationEmail } = await import('../mailjet-service');
      const emailSent = await sendVerificationEmail(verificationData);
      
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email via email service"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
        // Include the link in response for testing purposes
        verificationUrl: verificationUrl
      });
    } catch (emailError: any) {
      console.error('Error sending test verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: `Email service error: ${emailError.message}`,
        error: emailError
      });
    }
  } catch (error: any) {
    console.error("Test verification email error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Test login endpoint (ONLY available in development mode)
router.post("/test-login", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }
    
    // Get user with email
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
    
    // Check if the user's email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        code: "EMAIL_NOT_VERIFIED",
        userId: user.id
      });
    }
    
    // Verify password (handle null password safely)
    if (!user.password) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
    
    // Login the user
    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({
          success: false,
          message: "Login failed",
          error: err.message
        });
      }
      
      // Return user data (without sensitive information)
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword
      });
    });
  } catch (error: any) {
    console.error("Test login error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Test user verification status endpoint (ONLY available in development mode)
router.get("/verification-status/:email", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    
    // Get user with email
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }
    
    // Return verification status
    return res.status(200).json({
      success: true,
      email: user.email,
      verified: user.emailVerified
    });
  } catch (error: any) {
    console.error("Verification status error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Test session endpoint to check if the user is authenticated
router.get("/session-check", (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    const user = req.user;
    // Return user data (without sensitive information)
    const { password, ...userWithoutPassword } = user as any;
    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: userWithoutPassword,
      session: req.session
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });
  }
});

// Test endpoint to delete a user by email (ONLY available in development mode)
router.delete("/delete-user-by-email/:email", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email parameter is required" 
      });
    }
    
    // Find the user first to confirm it exists
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }
    
    // Delete the user
    await db.delete(users).where(eq(users.email, email));
    
    return res.status(200).json({
      success: true,
      message: `User with email ${email} has been successfully deleted`
    });
  } catch (error: any) {
    console.error("User deletion error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

export default router;