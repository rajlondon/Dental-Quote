import express, { Router, Request, Response } from "express";
import { db } from "../db";
import { createVerificationToken } from "../services/email-service";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

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

export default router;