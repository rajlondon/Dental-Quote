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
    console.log("Registration request received:", JSON.stringify({
      requestBody: req.body,
      contentType: req.headers['content-type']
    }));
    
    const { email, password, firstName, lastName, phone, consent, consentGDPR } = req.body;
    // Support both field names for consent (from different parts of the app)
    const userConsent = consent === true || consentGDPR === true;
    
    // Log full validation data for debugging
    console.log("Full validation check:", { 
      email: !!email, 
      password: !!password, 
      consentField: consent,
      consentGDPRField: consentGDPR,  
      finalConsent: userConsent
    });
    
    // Validate required fields
    if (!email || !password || !userConsent) {
      console.log("Registration validation failed:", { email: !!email, password: !!password, consent: userConsent });
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

// Verify email - This route is accessed via /verify-email?token=X on frontend
// but mapped to /api/auth/verify-email?token=X in the server
router.get("/verify-email", async (req: Request, res: Response) => {
  let userId: number | undefined;
  
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== "string") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid verification token" 
      });
    }
    
    // Verify token
    const tokenResult = await verifyToken(token, "email_verification");
    userId = tokenResult.userId;
    const valid = tokenResult.valid;
    
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
    
    // Redirect to email verified success page
    res.redirect("/email-verified");
  } catch (error: any) {
    console.error("Email verification error:", error);
    
    // Try to extract user email if possible from the token
    let userEmail = "";
    let userId: number | undefined;
    
    // Try to get userId from the token in the query
    try {
      const token = req.query.token as string;
      if (token) {
        const tokenData = await verifyToken(token, "email_verification");
        userId = tokenData.userId;
      }
    } catch (tokenError) {
      console.error("Error getting userId from token:", tokenError);
    }
    
    if (userId) {
      try {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (user && user.email) {
          userEmail = user.email;
        }
      } catch (dbError) {
        console.error("Error getting user email for verification failed page:", dbError);
      }
    }
    
    // Redirect to verification-failed page with email if available
    if (userEmail) {
      res.redirect(`/verification-failed?email=${encodeURIComponent(userEmail)}`);
    } else {
      res.redirect("/verification-failed");
    }
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

// Resend verification email
router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "You must be logged in to request a new verification email" 
      });
    }
    
    const userId = req.user?.id;
    
    // Get user with current verification status
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Your email is already verified" 
      });
    }
    
    // Create new verification token
    const verificationToken = await createVerificationToken(userId, "email_verification");
    
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
    
    // Import the Mailjet service
    try {
      const { sendVerificationEmail } = await import('../mailjet-service');
      const emailSent = await sendVerificationEmail(verificationData);
      
      if (!emailSent) {
        console.warn('Mailjet email sending failed or not configured');
        return res.status(500).json({ 
          success: false, 
          message: "Failed to send verification email. Please try again later." 
        });
      } else {
        console.log('Verification email resent successfully via Mailjet');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send verification email. Please try again later." 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Verification email has been sent to your email address. Please check your inbox."
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to resend verification email: " + error.message 
    });
  }
});



// Public resend verification (used after registration for users who aren't logged in)
router.post("/public-resend-verification", async (req: Request, res: Response) => {
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
      // For security, don't reveal if the user exists
      return res.status(200).json({
        success: true,
        message: "If your email is registered and not yet verified, a verification link has been sent."
      });
    }
    
    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: "If your email is registered and not yet verified, a verification link has been sent."
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
    
    // Import the Mailjet service
    try {
      const { sendVerificationEmail } = await import('../mailjet-service');
      const emailSent = await sendVerificationEmail(verificationData);
      
      if (!emailSent) {
        console.warn('Mailjet email sending failed or not configured');
        // Don't reveal error details for security
      } else {
        console.log('Verification email sent successfully via Mailjet');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't reveal error details for security
    }
    
    // For security, always return a successful response
    res.status(200).json({
      success: true,
      message: "If your email is registered and not yet verified, a verification link has been sent."
    });
  } catch (error: any) {
    console.error("Public resend verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process your request. Please try again later." 
    });
  }
});

export default router;