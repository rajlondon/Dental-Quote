import express, { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { createVerificationToken, formatVerificationEmail, formatPasswordResetEmail, verifyToken, markTokenAsUsed, markEmailAsVerified, getUserByEmail } from "../services/email-service";

const router = Router();

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, consent } = req.body;
    
    // Validate required fields
    if (!email || !password || !consent) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, password, and consent are required" 
      });
    }
    
    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      role: "patient", // Default role is patient
      emailVerified: false,
      profileComplete: false,
      status: "pending" // User is pending until email verification
    }).returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName
    });
    
    // Create verification token
    const verificationToken = await createVerificationToken(newUser.id, "email_verification");
    
    // Generate verification URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    // Format verification email data
    const userName = newUser.firstName || "User";
    const verificationData = {
      userEmail: newUser.email,
      userName: userName,
      verificationLink: verificationUrl
    };
    
    // Import the Mailjet service
    try {
      const { sendVerificationEmail } = await import('../mailjet-service');
      const emailSent = await sendVerificationEmail(verificationData);
      
      if (!emailSent) {
        console.warn('Mailjet email sending failed or not configured - continuing with registration');
        // We'll still create the account, but the user might need manual verification
      } else {
        console.log('Verification email sent successfully via Mailjet');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with registration even if email fails - we'll handle this case
    }
    
    // Return success without password
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailVerified: false
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed: " + error.message 
    });
  }
});

// Verify email
router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== "string") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid verification token" 
      });
    }
    
    // Verify token
    const { valid, userId } = await verifyToken(token, "email_verification");
    
    if (!valid || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token" 
      });
    }
    
    // Mark email as verified
    await markEmailAsVerified(userId);
    
    // Mark token as used
    await markTokenAsUsed(token);
    
    // Update user status
    await db
      .update(users)
      .set({ status: "active" })
      .where(eq(users.id, userId));
    
    // Redirect to login page with success message
    res.redirect("/portal-login?verified=true");
  } catch (error: any) {
    console.error("Email verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Email verification failed: " + error.message 
    });
  }
});

// Request password reset
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    
    // Find user
    const user = await getUserByEmail(email);
    
    // For security, don't reveal if user exists or not
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: "If your email is registered, you will receive a password reset link" 
      });
    }
    
    // Create password reset token
    const resetToken = await createVerificationToken(user.id, "password_reset");
    
    // Generate reset URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    // Format reset email data
    const userName = user.firstName || "User";
    const resetData = {
      userEmail: user.email,
      userName: userName,
      resetLink: resetUrl
    };
    
    // Import the Mailjet service
    try {
      const { sendPasswordResetEmail } = await import('../mailjet-service');
      const emailSent = await sendPasswordResetEmail(resetData);
      
      if (!emailSent) {
        console.warn('Mailjet password reset email sending failed or not configured');
        // Still return success to not reveal if email exists
      } else {
        console.log('Password reset email sent successfully via Mailjet');
      }
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Still return success to not reveal if email exists
      console.log('Suppressing password reset email error for security');
    }
    
    res.status(200).json({
      success: true,
      message: "If your email is registered, you will receive a password reset link"
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Password reset request failed: " + error.message 
    });
  }
});

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Token and new password are required" 
      });
    }
    
    // Verify token
    const { valid, userId } = await verifyToken(token, "password_reset");
    
    if (!valid || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
    
    // Mark token as used
    await markTokenAsUsed(token);
    
    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password."
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Password reset failed: " + error.message 
    });
  }
});

// Change password (for logged-in users)
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "You must be logged in to change your password" 
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password and new password are required" 
      });
    }
    
    // Get user with password
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Password change failed: " + error.message 
    });
  }
});



export default router;